import React, { useEffect, useState } from 'react'
import axios from "axios"
import { HOST } from "../models/network"
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, Pressable, FlatList, TouchableOpacity, Modal, TextInput, Image } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DatePicker from 'react-native-modern-datepicker';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'morgan'



const Course = ({ navigation, route }) => {
    const [course, setCourse] = useState([])
    const [loading, isLoading] = useState(null)
    const [openexercises, setOpenExercises] = useState(false)
    const [exerciseList, setExerciseList] = useState([])
    const [role, setRole] = useState("")
    const [selectedId, setSelectedId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false)
    const [exerciseTitle, setExerciseTitle] = useState()
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [selectedDate, setSelectedDate] = useState('');
    const [minDate, setMinDate] = useState("")
    const [doc, setDoc] = useState(null);

    const openExercises = () => {
        setOpenExercises(!openexercises)
    }

    const addExercise = () => {

        {/*Button will change state to true and view will re-render*/ }
    }

    const handleUpload = async () => {
        let result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true }).then(response => {
            if (response.type == 'success') {
                let { name, size, uri } = response;
                let nameParts = name.split('.');
                let fileType = nameParts[nameParts.length - 1];
                var fileToUpload = {
                    name: name,
                    size: size,
                    uri: uri,
                    type: "application/" + fileType
                };
                console.log(fileToUpload, '...............file')
                setDoc(fileToUpload);
            }
        });
    }

    const handleSubmit = async () => {

        if (exerciseTitle === '' || selectedDate === '' || doc === '') {
            alert("All fields are required");
            return;
        }
        const fileUri = doc.uri;
        const formData = new FormData();
        formData.append('document', doc);
        const courseID=course[0].courseID
        const resp = await axios.post(`http://${HOST}:8000/uploadExercise`, {courseID,exerciseTitle,selectedDate,formData}).then((res)=>{
            alert("Upload success");

        }).catch(err=>{alert("Failed to Upload")})
    }

    const courseDetails = async (courseID) => {
        try {
            const resp = axios.get(`http://${HOST}:8000/getCourse`, { params: { 'courseID': courseID } }).then((resJson) => {
                const dbData = Object.values(resJson.data)
                setCourse(dbData)
                setExerciseList(course[0].exercises)
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
    console.log(exerciseList)
    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}>No Exercises Available</Text>
            </View>
        );
    };
    const Item = ({ item }) => (
        <TouchableOpacity >
            <Text>{item.title}</Text>
        </TouchableOpacity>
    );
    const renderItem = ({ item }) => {

        return (
            <Item
                item={item}
                onPress={() => {
                    setSelectedId(item._id)
                }}
            />
        );
    };

    if (!loading) {
        return (
            <ActivityIndicator
                animating={true}
                style={styles.indicator}
                size="large"
            />
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.mainText}>{course[0].courseName}</Text>
                <Pressable style={styles.button} onPress={openExercises}>
                    <Text style={styles.text}>Exercises</Text>
                </Pressable>
                {role === "Lecturer" && openexercises ? <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => setModalVisible(!modalVisible)}
                >
                    <Text style={{ color: "blue", fontSize: 20 }}>Add Exercise</Text>

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
                                        onPress={() => setModalVisible(!modalVisible)}
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
                    />)
                    : console.log("asd")}

                <Pressable style={styles.button}>
                    <Text style={styles.text}>laboratories</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
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
})

export default Course