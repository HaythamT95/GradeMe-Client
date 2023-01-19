import React, { useEffect, useState } from 'react'
import axios from "axios"
import { HOST } from "../models/network"
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, Pressable, FlatList, TouchableOpacity, Modal, TextInput, Image, PermissionsAndroid, Button, Animated, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DatePicker from 'react-native-modern-datepicker';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import * as WebBrowser from 'expo-web-browser';
import moment from 'moment-timezone'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler'

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
    const [exerciseOpened, setExerciseOpened] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [grade, setGrade] = useState('')
    const [comment, setComment] = useState('')
    const [gradecommentUpdated, setGradecommentUpdated] = useState(true)
    const [user, setUser] = useState()
    const [addType, setAddType] = useState()
    const [openlaboratories, setOpenLaboratories] = useState(false)
    const [laboratoriesOpened, setLaboratoriesOpened] = useState(false)
    const [laboratoryList, setLaboratoryList] = useState([])

    const [animate, setAnimation] = useState({
        animation: new Animated.Value(0)
    })
    let row = [];
    let prevOpenedRow;
    const { StorageAccessFramework } = FileSystem;

    const [exerciseDetails, showExerciseDetails] = useState({
        _id: "", courseID: "", dateUntil: "", exercise: { _parts: [[Array]] }, listOfSubmitter: [], title: ""
    })

    if (exerciseDetails._id !== "") {
        if (grade === '' && modalVisible === true) {
            const g = exerciseDetails.listOfSubmitter.find(e => e.studentID === user._id)

            if (g !== undefined && gradecommentUpdated === true) {
                setGrade(g.grade)
                setComment(g.comments)
                setGradecommentUpdated(false)
            }
        }
    }

    function resetExerciseDetails() {
        showExerciseDetails({
            _id: "", courseID: "", dateUntil: "", exercise: { _parts: [[Array]] }, listOfSubmitter: [], title: ""
        })
        setDoc(null)
        setSelectedDate('')
        setExerciseTitle('')
    }

    const onRefreshExercises = async () => {
        //set isRefreshing to true
        setIsRefreshing(true)
        try {
            const resp = await axios.get(`${HOST}/getExercises`, { params: { 'exercises': course[0].exercises } }).then((resJson) => {
                const dbData = Object.values(resJson.data)
                setExerciseList(dbData)
            }).catch(err => err);
        } catch (e) { }
        // and set isRefreshing to false at the end of your callApiMethod()
        setIsRefreshing(false)
    }

    const onRefreshLabs = async () => {
        //set isRefreshing to true
        setIsRefreshing(true)
        try {
            const resp = await axios.get(`${HOST}/getLaboratories`, { params: { 'laboratories': course[0].laboratories } }).then((resJson) => {
                const dbData = Object.values(resJson.data)
                setLaboratoryList(dbData)
            }).catch(err => err);
        } catch (e) { }
        // and set isRefreshing to false at the end of your callApiMethod()
        setIsRefreshing(false)
    }


    const openExercises = async () => {
        setOpenExercises(!openexercises)

        if (openexercises === false) {
            isLoading(false)
            if (exerciseOpened === false) {
                try {
                    const resp = await axios.get(`${HOST}/getExercises`, { params: { 'exercises': course[0].exercises } }).then((resJson) => {
                        const dbData = Object.values(resJson.data)
                        setExerciseList(dbData)
                        isLoading(true)
                    }).catch(err => err);
                } catch (e) { }
                setExerciseOpened(true)
            }
            isLoading(true)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animate.animation, {
                        toValue: 1,
                        friction: 1,
                        useNativeDriver: true
                    }),
                    Animated.timing(animate.animation, {
                        toValue: 3,
                        friction: 1,
                        useNativeDriver: true
                    }),
                ])
            ).start();
        }
    }

    const openLaboratories = async () => {
        setOpenLaboratories(!openlaboratories)

        if (openlaboratories === false) {
            isLoading(false)
            if (laboratoriesOpened === false) {
                try {
                    const resp = await axios.get(`${HOST}/getLaboratories`, { params: { 'laboratories': course[0].laboratories } }).then((resJson) => {
                        const dbData = Object.values(resJson.data)
                        setLaboratoryList(dbData)
                        isLoading(true)
                    }).catch(err => err);
                } catch (e) { }
                setLaboratoriesOpened(true)
            }
            isLoading(true)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animate.animation, {
                        toValue: 1,
                        friction: 1,
                        useNativeDriver: true
                    }),
                    Animated.timing(animate.animation, {
                        toValue: 3,
                        friction: 1,
                        useNativeDriver: true
                    }),
                ])
            ).start();
        }
    }  

    /**
     * Upload file from device
     */
    const handleUpload = async () => {

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
                // console.log(fileToUpload, '...............file')
                setDoc(fileToUpload);
            }
        });

    }
    /**
     * Upload Exersice to database
     * 
     */
    const handleSubmit = async () => {
        if (role === "Lecturer") {
            if (exerciseTitle === '' || selectedDate === '' || doc === null) {
                alert("All fields are required");
                return;
            }
        }
        if (doc === null) {
            alert("All fields are required");
            return;
        }

        const formData = new FormData();

        formData.append('file', doc);
        formData.append('role', role)
        formData.append('courseID', course[0].courseID)

        if (role === "Lecturer") {
            formData.append('exerciseTitle', exerciseTitle)
            //console.log(exerciseTitle)

            formData.append('selectedDate', selectedDate)
            formData.append('addType', addType)

            if (exerciseDetails._id !== "") {
                formData.append('_id', exerciseDetails._id)
                formData.append('actionType', "updateExercise")
            }
            else
                formData.append('actionType', "newExercise")
        }

        if (role === "Student") {
            formData.append('exerciseID', exerciseIDPressOnList)
            const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
            const dataParsed = JSON.parse(data)
            const studentID = dataParsed.user._id
            const studentName = dataParsed.user.name
            formData.append('studentID', studentID)
            formData.append('studentName', studentName)
        }

        const config = {
            headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (data) => {
                return data
            }
        };
        const response = await axios.post(`${HOST}/upload`, formData, config).then(res => {
            resetExerciseDetails()
            alert("Upload success");
        }).catch(err => { alert("Upload failed, Try again") });
    }
    /*
     * Downloads file to user device
     */
    const downloadFile = async () => {
        try {
            //console.log(exerciseIDPressOnList)
            await WebBrowser.openBrowserAsync(`${HOST}/download/${exerciseIDPressOnList}`);
            alert("Download finished")
        } catch (error) {
            //console.error(error);
            //console.log("dd")
        }
    };

    const downloadFilegivenID = async (id) => {

        await WebBrowser.openBrowserAsync(`${HOST}/download/${id}`);
        alert("Download finished")

    };

    const courseDetails = async (courseID) => {
        try {
            const resp = await axios.get(`${HOST}/getCourse`, { params: { 'courseID': courseID } }).then((resJson) => {
                const dbData = Object.values(resJson.data)
                setCourse(dbData)
                isLoading(true)

            }).catch(err => err);
            const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
            const dataParsed = JSON.parse(data)
            const roleDB = dataParsed.user.role
            setRole(roleDB)
            //console.log(dataParsed.user)
            setUser(dataParsed.user)
            let date = new Date().toISOString()
            date = date.substring(0, date.indexOf('T'))
            setMinDate(date)
        }
        catch (e) {
            //console.log(e)
        }
    }

    useEffect(() => {
        courseDetails(route.params?.courseID);
    }, [exerciseList, laboratoryList]);

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}>No Data Available</Text>
            </View>
        );
    };

    // const convertDateToMyZone = (date) => {
    //     const utcTime = new Date(date)
    //     const timeZone = 'Asia/Jerusalem';
    //     const localTime = moment(utcTime).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    //     return localTime
    // }

    const convertDateToMyString = (date) => {
        const Date = date.substring(0, date.indexOf('T')) + ' ' + date.substring(date.indexOf('T') + 1, date.length - 5);
        //console.log(Date)
        return Date
    }

    const deleteItem = async ({ item, index }) => {
        setExerciseList(exerciseList.filter(e => e._id !== item._id))
        setLaboratoryList(laboratoryList.filter(e => e._id !== item._id))

        const response = await axios.delete(`${HOST}/delete/${item._id}`).then(res => {
            alert("Deleted!");
        }).catch(err => { alert("Deleting failed, Try again") });
    };

    const updateItem = ({ item, index }) => {
        const a = exerciseList.find(e => e._id === item._id)
        const b = laboratoryList.find(e => e._id === item._id)

        if (a !== undefined) {
            setAddType('Exercise')
        }
        else {
            setAddType('Laboratory')
        }
        showExerciseDetails(item)
        setExerciseTitle(item.title)
        setSelectedDate(convertDateToMyString(item.dateUntil))
        setModalVisibleAddExercise(!modalVisibleAddExercise)
    }

    const longPress = (id) => {
        if (role === 'Lecturer') {
            Alert.alert(
                "Download File",
                "Are you sure?",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel"
                    },
                    {
                        text: "OK", onPress: () => {
                            downloadFilegivenID(id)
                        }
                    }
                ]
            );
        }
    }

    const Item = ({ item, onPress, onLongPress }) => (
        <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
            <View style={{ justifyContent: 'space-between', flexDirection: "row" }}>
                <View >
                    <Text style={{
                        //  padding: 10,
                        fontSize: 25,
                        // height: 44,
                        color: "#000000",
                        flex: 1,
                    }}>{item.title} </Text>
                    <Text style={{ color: "#000000", fontWeight: 'bold' }}>Due To: {convertDateToMyString(item.dateUntil)}</Text>
                </View>
                <View style={{ marginRight: 10 }}>
                    <MaterialIcons name="keyboard-arrow-right" size={25} color="#000000" />
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
                                    onPress={() => {
                                        setDoc(null)
                                        setGrade('')
                                        setComment('')
                                        setModalVisible(false)
                                        setGradecommentUpdated(true)
                                    }}
                                >
                                    <Text style={styles.textStyle}>X</Text>
                                </Pressable>
                            </View>
                            <Text style={{ textAlign: "center", fontSize: 25, fontWeight: 'bold', marginBottom: "15%" }}>Task Details</Text>
                            <Text style={{ fontSize: 20, marginBottom: '10%' }}>Exercise Name: {exerciseDetails.title}</Text>
                            <Text style={{ fontSize: 20, marginBottom: '10%' }}>Due date: {exerciseDetails.dateUntil.substring(0, exerciseDetails.dateUntil.indexOf('T'))} {exerciseDetails.dateUntil.substring(exerciseDetails.dateUntil.indexOf('T') + 1, exerciseDetails.dateUntil.length - 5)}
                            </Text>

                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontSize: 20 }}>Task File: </Text>
                                <Pressable style={styles.addBtn} onPress={downloadFile}><Text style={{ color: "blue", fontSize: 20, marginRight: "10%", textDecorationLine: 'underline' }}>Download
                                    <FontAwesome5 style={{ marginLeft: "10%" }} name="file-download" size={25} color="black" />
                                </Text></Pressable>
                            </View>

                            <Pressable style={[styles.addBtn, { marginTop: '10%' }]} onPress={handleUpload}><Text style={{ color: "blue", fontSize: 20, textDecorationLine: 'underline' }}>Upload Your File
                                <FontAwesome5 style={{ marginLeft: "10%" }} name="file-upload" size={25} color="black" />
                            </Text></Pressable>
                            {doc !== null ?
                                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                    <Text style={{ alignSelf: "center", textAlign: "center" }}>File: {doc.name}</Text>
                                    <Image source={require("../assets/checkmark.png")} style={styles.imageStyles} />
                                </View>
                                : ''}
                            <Text style={[{ fontSize: 20, marginBottom: '10%', marginTop: '10%' }]}>Grade: {grade} </Text>
                            <Text style={[{ fontSize: 20 }]}>Comments:</Text>
                            <Text style={[{ fontSize: 20, marginBottom: '10%' }]}>"{comment}"</Text>
                            <Pressable style={[styles.button, { width: '55%', borderRadius: 20, backgroundColor: "green" }]} onPress={handleSubmit}><Text style={styles.text}>Submit</Text></Pressable>

                        </View>
                    </View>
                </Modal> : ''}

        </TouchableOpacity>
    );

    const renderItem = ({ item, index }, onClickDelete, onClickUpdate) => {
        const closeRow = (index) => {
            if (prevOpenedRow && prevOpenedRow !== row[index]) {
                prevOpenedRow.close();
            }
            prevOpenedRow = row[index];
        };

        const renderRightActions = (progress, dragX, onClickDelete, onClickUpdate) => {
            return (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                    <Button color="blue" onPress={onClickUpdate} title="UPDATE"></Button>
                    <Button color="red" onPress={onClickDelete} title="DELETE"></Button>
                </View>
            );
        };

        async function getUsersImages(listOfSubmitter) {
            if (listOfSubmitter.length > 0) {
                let students = []
                listOfSubmitter.forEach(student => { students.push(student.studentID) })
                let x;
                let y = []

                const resp = await axios.get(`${HOST}/getAllStudentsImages`, { params: { 'students': students } }).then(response => {
                    const updated = response.data.forEach(student => {
                        listOfSubmitter.forEach(submit => {
                            if (submit.studentID == student[0]) {
                                x = { studentID: submit.studentID, image: student[1] };
                                y.push(x)
                            }
                        })
                    })

                })
                return y;
            }
        }

        return (
            <GestureHandlerRootView>
                {role === 'Lecturer' ?
                    <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, onClickDelete, onClickUpdate)} onSwipeableOpen={() => closeRow(index)}
                        ref={(ref) => (row[index] = ref)}
                        rightOpenValue={-100}>
                        <View style={styles.listItem}>
                            <Item
                                item={item}
                                onPress={async () => {
                                    const images = await getUsersImages(item.listOfSubmitter)
                                    navigation.navigate({
                                        name: 'Submitters',
                                        params: { listOfSubmitter: item.listOfSubmitter, exerciseID: item._id, title: item.title, images: images, dateUntil: item.dateUntil },
                                    })

                                }}
                                onLongPress={() => longPress(item._id)}
                            />
                        </View>
                    </Swipeable>
                    :
                    <View style={styles.listItem}>
                        <Item
                            item={item}
                            onPress={() => {
                                {
                                    showExerciseDetails(item)
                                    setExerciseIDPressOnList(item._id)
                                    setModalVisible(true);
                                }
                            }}
                            onLongPress={() => longPress(item._id)}
                        />
                    </View>}
            </GestureHandlerRootView>
        );
    };

    const trans = {
        transform: [
            { translateY: animate.animation }
        ]
    }
    const renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: "95%",
                    marginLeft: "2%",
                    marginRight: "2%",
                    marginBottom: "2%",
                }}
            />
        );
    };

    if (modalVisibleAddExercise === true) {

        return (
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
                                onPress={() => {
                                    resetExerciseDetails()
                                    setModalVisibleAddExercise(!modalVisibleAddExercise)
                                }}
                            >
                                <Text style={styles.textStyle}>X</Text>
                            </Pressable>
                        </View>
                        {addType === 'Exercise' ? <Text style={{ textAlign: "center", fontSize: 25, fontWeight: 'bold', marginBottom: "15%" }}>Add Exercise</Text> :
                            <Text style={{ textAlign: "center", fontSize: 25, fontWeight: 'bold', marginBottom: "15%" }}>Add Laboratory</Text>}

                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 20 }}>Name</Text>
                            <TextInput style={styles.input} onChangeText={(text) => setExerciseTitle(text)}>{exerciseDetails.title !== "" ? exerciseDetails.title : ""}</TextInput>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 20 }}>Due date: {selectedDate ? selectedDate : "  DD/MM/YYYY"}</Text>
                            <Pressable style={[{ width: '60%' }]} onPress={() => setShowDatePicker(!showDatePicker)}>
                                {showDatePicker ?
                                    <FontAwesome5 style={{ marginLeft: "10%" }} name="window-close" size={25} color="red" /> :
                                    <View style={{ marginLeft: "10%" }}><FontAwesome5 name="calendar-alt" size={25} color="blue" /></View>}
                            </Pressable>
                        </View>
                        {showDatePicker ?
                            <DatePicker
                                onSelectedChange={date => setSelectedDate(date)}
                                minimumDate={minDate}
                            />
                            : ''}
                        <Pressable style={[styles.addBtn, { marginTop: "10%" }]} onPress={handleUpload}><Text style={{ color: "blue", fontSize: 20, textDecorationLine: 'underline' }}>Upload
                            <FontAwesome5 style={{ marginLeft: "5%" }} name="file-upload" size={25} color="black" />
                        </Text></Pressable>

                        {doc !== null ?
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <Text style={{ alignSelf: "center", textAlign: "center" }}>File: {doc.name}</Text>
                                <Image source={require("../assets/checkmark.png")} style={styles.imageStyles} />
                            </View>
                            : ''}
                        <Pressable style={[styles.button, { width: '55%', borderRadius: 20, backgroundColor: "green", marginTop: "10%" }]} onPress={handleSubmit}><Text style={styles.text}>Submit</Text></Pressable>
                    </View>
                </View>
            </Modal>
        );
    }

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
                        <Text style={[styles.text]}>Exercises {!openexercises ?
                            <MaterialIcons name="arrow-forward-ios" size={15} color="white" /> :
                            <MaterialIcons name="keyboard-arrow-down" size={15} color="white" />}
                        </Text>
                    </Pressable>

                    {role === "Lecturer" && openexercises ?
                        <View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => {
                                    setModalVisibleAddExercise(!modalVisibleAddExercise)
                                    setAddType('Exercise')
                                }}>
                                <Text style={{ color: "blue", fontSize: 20, textDecorationLine: 'underline' }}>Add Exercise</Text>
                            </TouchableOpacity>

                            <Animated.View style={[styles.ball, trans, { alignItems: 'center' }]}>
                                <FontAwesome5 name="angle-double-down" size={25} color="black" />
                                <Text style={{ fontSize: 12 }}>Swipe down to refresh</Text>
                            </Animated.View>
                        </View>
                        : ''}

                    {openexercises ? (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={exerciseList}
                                renderItem={(v) =>
                                    renderItem(v, () => {
                                        //console.log('Pressed', v);
                                        deleteItem(v);
                                    }, () => {
                                        //console.log('Pressed', v);
                                        updateItem(v);
                                    })
                                }
                                ListEmptyComponent={myListEmpty}
                                keyExtractor={(item) => item._id}
                                ItemSeparatorComponent={renderSeparator}
                                onRefresh={onRefreshExercises}
                                refreshing={isRefreshing}

                            />
                        </View>
                    )
                        : ''}

                    <Pressable style={styles.button} onPress={openLaboratories}>
                        <Text style={[styles.text]}>Laboratories {!openlaboratories ?
                            <MaterialIcons name="arrow-forward-ios" size={15} color="white" /> :
                            <MaterialIcons name="keyboard-arrow-down" size={15} color="white" />}
                        </Text>
                    </Pressable>

                    {role === "Lecturer" && openlaboratories ?
                        <View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => {
                                    setModalVisibleAddExercise(!modalVisibleAddExercise)
                                    setAddType('Laboratory')
                                }}>
                                <Text style={{ color: "blue", fontSize: 20, textDecorationLine: 'underline' }}>Add Laboratory</Text>
                            </TouchableOpacity>

                            <Animated.View style={[styles.ball, trans, { alignItems: 'center' }]}>
                                <FontAwesome5 name="angle-double-down" size={25} color="black" />
                                <Text style={{ fontSize: 12 }}>Swipe down to refresh</Text>
                            </Animated.View>
                        </View> : ''}

                    {openlaboratories ? (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={laboratoryList}
                                renderItem={(v) =>
                                    renderItem(v, () => {
                                        //console.log('Pressed', v);
                                        deleteItem(v);
                                    }, () => {
                                        //console.log('Pressed', v);
                                        updateItem(v);
                                    })
                                }
                                ListEmptyComponent={myListEmpty}
                                keyExtractor={(item) => item._id}
                                ItemSeparatorComponent={renderSeparator}
                                onRefresh={onRefreshLabs}
                                refreshing={isRefreshing}

                            />
                        </View>
                    )
                        : ''}

                </View>
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    ball: {
        width: "100%",
        height: 50,
        position: 'relative',
    },
    container: { flex: 1, justifyContent: "space-between" },
    imageStyles: { width: 25, height: 25 },
    mainText: {
        fontSize: 30,
        textAlign: "center",
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        fontWeight: 'bold',
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
        backgroundColor: '#5669FF',
        width: '95%',
        marginVertical: 5,
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
        marginTop: 22,
    },
    modalView: {
        width: "90%",
        margin: 20,
        backgroundColor: "white",
        borderRadius: 50,
        padding: 35,
        shadowColor: "#000000",
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
        marginLeft: 20,
        marginBottom: 30,
        minWidth: "60%",
        fontSize: 20,
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
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "white",
        padding: 5,
        borderRadius: 15,
    },
})

export default Course