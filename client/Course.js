import React, { useEffect, useState } from 'react'
import axios from "axios"
import { HOST } from "../models/network"
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, Pressable, FlatList, TouchableOpacity, Modal, TextInput, Image, PermissionsAndroid, ScrollView, VirtualizedList } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DatePicker from 'react-native-modern-datepicker';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons'
import { downloadFileFromUri, checkFileIsAvailable, openDownloadedFile } from 'expo-downloads-manager';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
import { Buffer } from "buffer"
import * as WebBrowser from 'expo-web-browser';

const Course = ({ navigation, route }) => {
    const [course, setCourse] = useState([])
    const [loading, isLoading] = useState(false)
    const [openexercises, setOpenExercises] = useState(false)
    const [exerciseList, setExerciseList] = useState([])
    const [role, setRole] = useState("")
    const [selectedId, setSelectedId] = useState(null);
    const [modalVisibleAddExercise, setModalVisibleAddExercise] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [exerciseTitle, setExerciseTitle] = useState()
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [selectedDate, setSelectedDate] = useState('');
    const [minDate, setMinDate] = useState("")
    const [doc, setDoc] = useState(null);
    const [exerciseIDPressOnList, setExerciseIDPressOnList] = useState()
    const { StorageAccessFramework } = FileSystem;

    const [exerciseDetails, showExerciseDetails] = useState({
        _id: "", courseID: "", dateUntil: "", exercise: { _parts: [[Array]] }, listOfSubmitter: [], title: ""
    })

    const openExercises = async () => {
        setOpenExercises(!openexercises)
        
        if (openexercises === false) {
            isLoading(false)
            //console.log(course[0].exercises)
            try {
                const resp = await axios.get(`http://${HOST}:8000/getExercises`, { params: { 'exercises': course[0].exercises } }).then((resJson) => {
                    const dbData = Object.values(resJson.data)
                    //console.log(dbData)
                    setExerciseList(dbData)
                    isLoading(true)
                    // exerciseList.map(e=>console.log(e._id))
                }).catch(err => err);
            } catch (e) { }
        }
    }

    const checkPermissions = async () => {
        try {
            const result = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
            );

            if (!result) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title:
                            'You need to give storage permission to download and save the file',
                        message: 'App needs access to your camera ',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                } else {
                    Alert.alert('Error', I18n.t('PERMISSION_ACCESS_FILE'));

                    console.log('Camera permission denied');
                    return false;
                }
            } else {
                return true;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const handleUpload = async () => {
        //const result = await checkPermissions();
        if (true) {
            let result = await DocumentPicker.getDocumentAsync().then(async (response) => {
                if (response.type == 'success') {
                    let { name, size, uri } = response;

                    let nameParts = name.split('.');
                    let fileType = nameParts[nameParts.length - 1];
                    var fileToUpload = {
                        name: name,
                        size: size,
                        uri: uri,
                        type: 'application/' + fileType
                    };
                    console.log(fileToUpload, '...............file')
                    setDoc(fileToUpload);
                }
            });
        }
    }

    const handleSubmit = async () => {
        if (role === "Lecturer") {
            if (exerciseTitle === '' || selectedDate === '' || doc === '') {
                alert("All fields are required");
                return;
            }
        }
        if(doc === ''){
            alert("All fields are required");
                return;
        }

        const formData = new FormData();
        formData.append('file', doc);
        formData.append('role', role)

        if (role === "Lecturer") {
            formData.append('exerciseTitle', exerciseTitle)
            formData.append('selectedDate', selectedDate)
        }
        if (role === "Student") {
            formData.append('exerciseID', exerciseIDPressOnList)
            const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
            const dataParsed = JSON.parse(data)
            const studentID = dataParsed.user._id
            const studentName = dataParsed.user.name
            formData.append('studentID', studentID)
            formData.append('studentName',studentName)
        }


        const config = {
            headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (data) => {
                return data
            }
        };
        console.log("aa")
        const response = await axios.post(`http://${HOST}:8000/upload`, formData, config).then(res => {
            alert("Upload success");
            console.log(res)
        });

    }
    /*
     * Downloads file to user device
     */
    const downloadFile = async () => {
        try {
            console.log(exerciseIDPressOnList)
            await WebBrowser.openBrowserAsync(`http://${HOST}:8000/download/${exerciseIDPressOnList}`);
            alert("Download finished")
        } catch (error) {
            console.error(error);
            console.log("dd")
        }
    };


    const courseDetails = async (courseID) => {
        try {
            const resp = await axios.get(`http://${HOST}:8000/getCourse`, { params: { 'courseID': courseID } }).then((resJson) => {
                const dbData = Object.values(resJson.data)
                setCourse(dbData)
                //console.log(dbData[0].exercises)
                //setExerciseList(dbData[0].exercises)
                isLoading(true)

            }).catch(err => err);
            const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
            const dataParsed = JSON.parse(data)
            const roleDB = dataParsed.user.role
            setRole(roleDB)
            console.log(roleDB)
            let date = new Date().toISOString()
            date = date.substring(0, date.indexOf('T'))
            setMinDate(date)
        }
        catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        courseDetails(route.params?.courseID);
    }, []);


    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}>No Exercises Available</Text>
            </View>
        );
    };
    const Item = ({ item, onPress }) => (
        <TouchableOpacity onPress={onPress}>
            <View style={{ flexDirection: 'row' }}>
                <Text style={{
                    //  padding: 10,
                    fontSize: 25,
                    // height: 44,
                    color: "#1a8cff",
                    flex: 1,
                }}>{item.title} </Text>
                <View style={{ marginRight: 10 }}>
                    <MaterialIcons name="keyboard-arrow-right" size={25} color="#1a8cff" />
                </View>
            </View>
            {role === 'Student' && modalVisible === true ?
                <Modal
                    animationType={"fade"}
                    transparent={false}
                    visible={modalVisible}
                    onRequestClose={() => { console.log("Modal has been closed.") }}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                <Pressable
                                    style={styles.buttonClose}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.textStyle}>X</Text>
                                </Pressable>
                            </View>
                            <Text style={[styles.modalText, { marginBottom: 10 }]}>Exercise Name: {exerciseDetails.title}</Text>
                            <Text style={[styles.modalText, { marginBottom: 10 }]}>Submitting Date: {exerciseDetails.dateUntil.substring(0, exerciseDetails.dateUntil.indexOf('T'))} {exerciseDetails.dateUntil.substring(exerciseDetails.dateUntil.indexOf('T') + 1, exerciseDetails.dateUntil.length - 5)}
                            </Text>
                            <Pressable style={[styles.addBtn, { marginBottom: 50 }]} onPress={downloadFile}><Text style={{ color: "blue", fontSize: 20 }}>Download
                                <MaterialIcons name="file-download" size={20} color="black"></MaterialIcons>
                            </Text></Pressable>

                            <Pressable style={styles.addBtn} onPress={handleUpload}><Text style={{ color: "blue", fontSize: 20 }}>Upload Your File
                                <MaterialIcons name="file-upload" size={20} color="black"></MaterialIcons>
                            </Text></Pressable>
                            {doc !== null ?
                                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                    <Text style={{ alignSelf: "center", textAlign: "center" }}>File: {doc.name}</Text>
                                    <Image source={require("../assets/checkmark.png")} style={styles.imageStyles} />
                                </View>
                                : console.log("")}
                            <Text style={[styles.modalText, { marginBottom: 10 }]}>Grade: { } </Text>
                            <Text style={[styles.modalText, { marginBottom: 10 }]}>Comments: { } </Text>
                            <Pressable style={[styles.button, { backgroundColor: "green" }]} onPress={handleSubmit}><Text style={styles.text}>Submit</Text></Pressable>

                        </View>
                    </View>
                </Modal> : console.log("false")}

        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        return (
            <View style={styles.listItem}>
                <Item
                    item={item}
                    onPress={() => {
                        {
                            role === "Lecturer" ?
                                navigation.navigate({
                                    name: 'Submitters',
                                    params: { listOfSubmitter: item.listOfSubmitter,exerciseID:item._id },
                                })
                                :
                            showExerciseDetails(item)
                            setExerciseIDPressOnList(item._id)
                            setModalVisible(true);
                        }
                    }}
                />
            </View>
        );
    };

    const renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "95%",
                    backgroundColor: "#CED0CE",
                    marginLeft: "2%",
                    marginRight: "2%",
                }}
            />
        );
    };

    if (loading === false) {
        return (
            <ActivityIndicator
                animating={true}
                style={styles.indicator}
                size="large"
            />
        );
    }
    else {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.mainText}>{course[0].courseName}</Text>
                    <Pressable style={styles.button} onPress={openExercises}>
                        <Text style={styles.text}>Exercises {!openexercises ?
                            <MaterialIcons name="arrow-forward-ios" size={15} color="white" /> :
                            <MaterialIcons name="keyboard-arrow-down" size={15} color="white" />}
                        </Text>
                    </Pressable>

                    {role === "Lecturer" && openexercises ?
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => setModalVisibleAddExercise(!modalVisibleAddExercise)}>

                            <Text style={{ color: "blue", fontSize: 20 }}>Add Exercise</Text>

                            <Modal
                                animationType={"fade"}
                                transparent={false}
                                visible={modalVisibleAddExercise}
                                onRequestClose={() => { console.log("Modal has been closed.") }}>
                                <View style={styles.centeredView}>
                                    <View style={styles.modalView}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <Pressable
                                                style={styles.buttonClose}
                                                onPress={() => setModalVisibleAddExercise(!modalVisibleAddExercise)}
                                            >
                                                <Text style={styles.textStyle}>X</Text>
                                            </Pressable>
                                        </View>
                                        <Text style={styles.modalText}>Exercise Name</Text>
                                        <TextInput style={styles.input} onChangeText={(text) => setExerciseTitle(text)}></TextInput>

                                        <Text style={styles.modalText}>Last submitting date 📅</Text>
                                        <Pressable style={styles.button} onPress={() => setShowDatePicker(!showDatePicker)}>{showDatePicker ? <Text style={styles.text}>
                                            Hide
                                        </Text> : <Text style={styles.text}> Select</Text>}
                                        </Pressable>
                                        {showDatePicker ?
                                            <DatePicker
                                                onSelectedChange={date => setSelectedDate(date)}
                                                minimumDate={minDate}
                                            />
                                            : <Text style={{ alignSelf: "center", textAlign: "center", marginBottom: 20, fontSize: 15 }}>Submitting Date: {selectedDate}</Text>}
                                        <Pressable style={styles.addBtn} onPress={handleUpload}><Text style={{ color: "blue", fontSize: 20, textDecorationLine: 'underline' }}>Upload📑</Text></Pressable>
                                        {doc !== null ?
                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                <Text style={{ alignSelf: "center", textAlign: "center" }}>File: {doc.name}</Text>
                                                <Image source={require("../assets/checkmark.png")} style={styles.imageStyles} />
                                            </View>
                                            : console.log("")}
                                        <Pressable style={[styles.button, { backgroundColor: "green" }]} onPress={handleSubmit}><Text style={styles.text}>Submit</Text></Pressable>
                                    </View>
                                </View>
                            </Modal>
                        </TouchableOpacity> : console.log("")}
                    {openexercises ? (
                        <FlatList
                            data={exerciseList}
                            renderItem={renderItem}
                            ListEmptyComponent={myListEmpty}
                            keyExtractor={(item) => item._id}
                            ItemSeparatorComponent={renderSeparator}
                        />)
                        : console.log("asd")}

                    <Pressable style={styles.button}>
                        <Text style={styles.text}>laboratories</Text>
                    </Pressable>

                </View>
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    imageStyles: { width: 25, height: 25 },
    mainText: {
        fontSize: 30,
        textAlign: "left",
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    indicator: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 5,
        elevation: 3,
        backgroundColor: '#3066be',
        width: '95%',
        marginVertical: 15,
    },
    text: {
        fontSize: 20,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
    },
    addBtn: {
        backgroundColor: "transparent",
        alignSelf: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        width: "90%",
        margin: 20,
        backgroundColor: "white",
        borderRadius: 50,
        padding: 35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "lightgrey",
        borderRadius: 50,
    },
    textStyle: {
        textAlign: "center",
        paddingLeft: 5,
        paddingRight: 5,
        fontSize: 20,
    },
    modalText: {
        textAlign: "center",
        fontSize: 20,
    },
    input: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#8e93a1",
        marginBottom: 30,
        minWidth: "50%"
    },
    modalHeader: {
        flexDirection: "row",
        borderColor: "black"
    },
    modalHeaderContent: {
        flexGrow: 1,
    },
    listItem: {
        width: "95%",
        marginLeft: "2%",
        marginRight: "2%",
        backgroundColor: "#e6e6e6",
        borderWidth: 1,
        borderColor: "black",
        padding: 5,
    },
})

export default Course