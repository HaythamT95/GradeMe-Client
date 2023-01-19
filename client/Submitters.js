import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Pressable, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser';
import { HOST } from "../models/network"
import axios from "axios"
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import moment from 'moment-timezone'

const Submitters = ({ navigation, route }) => {
    const [listOfSubmitter, setListOfSubmitter] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [exerciseID, setExerciseID] = useState()
    const [studentId, setStudentID] = useState('')
    const [studentGrade, setStudentGrade] = useState("")
    const [comment, setComment] = useState("")
    const [studentName, setStudentName] = useState('')
    const nav = useNavigation()
    const [dateUntil, setdateUntil] = useState()
    const [image, setImage] = useState([{
        studentID: '', image: ''
    }])

    function setdateUntilFunc(date) {
        let twoHoursBefore = new Date(date);
        twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);
        setdateUntil(twoHoursBefore)
    }

    useEffect(() => {
        setListOfSubmitter(route.params?.listOfSubmitter)
        setExerciseID(route.params?.exerciseID)
        setdateUntilFunc(new Date(route.params?.dateUntil))
        //setdateUntil(new Date(route.params?.dateUntil))
        nav.setOptions({ title: route.params?.title })
        setImage(route.params?.images)
    }, []);
    //console.log(image)
    const convertDateToMyZone = (date) => {
        const utcTime = new Date(date)
        const timeZone = 'Asia/Jerusalem';
        const localTime = moment(utcTime).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
        return localTime
    }

    const handleSubmit = async () => {
        try {
            if (studentGrade < 0 || studentGrade > 100) {
                alert("Please enter valid grade");
                return
            }
            const response = await axios.post(`${HOST}/updateStudentGrade`, { exerciseID, studentId, studentGrade, comment }).then(res => {
                alert("Submit success");
                //console.log(res)
            });
        } catch (e) { console.log(e) }
    }

    const downloadFile = async () => {
        try {
            await WebBrowser.openBrowserAsync(`${HOST}/downloadUserFile?param1=${exerciseID}&param2=${studentId}`);
            alert("Download finished")
        } catch (error) {
            // console.error(error);
        }
    };

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.mainText}>No Submitters Yet</Text>
            </View>
        );
    };

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


    function getImageURL(studentID) {
        let student = image.filter(student => student.studentID === studentID)
        if (student.length > 0) {
            return 'data:image/jpeg;base64,' + student[0].image;
        }
        else {
            return 0;
        }
    }

    const Item = ({ item, onPress }) => (


        <TouchableOpacity onPress={onPress}>
            <View style={{ flex: 1, flexDirection: "row", }}>
                {/* {image.map(student => {
                    if (student.studentID === item.studentID)
                        URL = 'data:image/jpeg;base64,' + student.image;
                    else
                        URL = '';
                })} */}
                {getImageURL(item.studentID) === 0 ? <Image source={require("../assets/blank-profile-pic.png")} style={styles.avatar} /> :
                    <Image style={styles.avatar} source={{ uri: getImageURL(item.studentID) }} />}

                <Text style={{
                    padding: 5,
                    fontSize: 25,
                    color: "#1a8cff",
                    flex: 1,
                }}>{item.studentName}</Text>
                <Text style={{
                    fontSize: 15,
                    color: convertDateToMyZone(item.submitDate) > convertDateToMyZone(dateUntil) ? 'red' : 'green',
                    justifyContent: 'flex-end'
                }}>{convertDateToMyZone(item.submitDate) > convertDateToMyZone(dateUntil) ? "Late Submit" : "Early Submit"}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        return (
            <View style={styles.listItem}>
                <Item
                    item={item}
                    onPress={() => {
                        setStudentID(item.studentID)
                        setStudentName(item.studentName)
                        setComment(item.comments)
                        setStudentGrade(item.grade)
                        setModalVisible(true)
                    }}
                />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>
                {listOfSubmitter.length > 0 ? <Text style={styles.mainText}>{"Submitters"}</Text> :
                    ''}
                <FlatList
                    data={listOfSubmitter}
                    renderItem={renderItem}
                    ListEmptyComponent={myListEmpty}
                    keyExtractor={(item) => item.studentID}
                    ItemSeparatorComponent={renderSeparator}
                />

                {modalVisible === true ?

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

                                <Text style={{ textAlign: "center", fontSize: 25, fontWeight: 'bold', marginBottom: "15%" }}>Submitter Details</Text>
                                <Text style={{ fontSize: 20, marginBottom: '10%' }}>Student Name: {studentName}</Text>


                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ fontSize: 20 }}>Student File: </Text>
                                    <Pressable style={[styles.addBtn]} onPress={downloadFile}>
                                        <Text style={{ color: "blue", fontSize: 20 }}>Download  <FontAwesome5 style={{ marginLeft: "10%" }} name="file-download" size={25} color="black" /></Text>
                                    </Pressable>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: '10%' }}>
                                    <Text style={{ fontSize: 20 }}>Grade:</Text>
                                    <TextInput style={[styles.input, { minWidth: "15%", textAlign: 'center' }]} keyboardType='numeric' maxLength={3} onChangeText={(text) => {
                                        setStudentGrade(text)
                                    }}>{studentGrade ? studentGrade : ''}</TextInput>
                                </View>

                                <View style={{ flexDirection: 'column' }}>
                                    <Text style={{ fontSize: 20, marginBottom: 10 }} >Comments: { } </Text>
                                    <TextInput style={styles.input} multiline={true} onChangeText={(text) => setComment(text)}>{comment ? comment : ''}</TextInput>
                                </View>
                                <Pressable style={[styles.button, { width: '50%', borderRadius: 20, backgroundColor: "green" }]} onPress={handleSubmit}><Text style={styles.text}>Submit</Text></Pressable>

                            </View>
                        </View>
                    </Modal> : ''}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    listItem: {
        width: "95%",
        marginLeft: "2%",
        marginRight: "2%",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "white",
        padding: 10,
        borderRadius: 15,
    },
    mainText: {
        fontSize: 30,
        textAlign: "center",
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        fontWeight: 'bold',
    },
    textStyle: {
        textAlign: "center",
        paddingLeft: 5,
        paddingRight: 5,
        fontSize: 20,
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
    modalText: {
        textAlign: "center",
        fontSize: 20,
    },
    text: {
        fontSize: 20,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
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
        width: '50%',
        marginVertical: 15,
    },
    input: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#8e93a1",
        marginLeft: 20,
        marginBottom: 30,
        minWidth: "60%",
        fontSize: 20,
    },
    buttonClose: {
        backgroundColor: "lightgrey",
        borderRadius: 50,
    },
    addBtn: {
        backgroundColor: "transparent",
        alignSelf: 'center',
    },
    avatar: {
        height: 50,
        width: 50,
        borderRadius: 100,
        padding: 20,
    },
})

export default Submitters;