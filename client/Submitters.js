import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View,FlatList,TouchableOpacity,Modal,Pressable,TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser';
import { HOST } from "../models/network"
import axios from "axios"

const Submitters = ({ navigation, route }) => {
    const [listOfSubmitter, setListOfSubmitter] = useState([])
    const [modalVisible, setModalVisible] = useState(false)
    const [exerciseID,setExerciseID]=useState()
    const [studentId,setStudentID]=useState('')
    const [studentGrade,setStudentGrade]=useState("")
    const [comment,setComment] = useState("")
    const [studentName,setStudentName] = useState('')

    useEffect(() => {
        setListOfSubmitter(route.params?.listOfSubmitter)
        setExerciseID(route.params?.exerciseID)
    },[]);

    const handleSubmit = async ()=>{
        try{
            const response = await axios.post(`http://${HOST}:8000/updateStudentGrade`, {exerciseID,studentId,studentGrade,comment}).then(res => {
                alert("Submit success");
                console.log(res)
            });
        }catch(e){console.log(e)}
    }

    const downloadFile = async () => {
        try {
            await WebBrowser.openBrowserAsync(`http://${HOST}:8000/downloadUserFile?param1=${exerciseID}&param2=${studentId}`);
            alert("Download finished")
        } catch (error) {
            console.error(error);
        }
    };

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}>No Submitters Yet</Text>
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

    const Item = ({ item, onPress }) => (
        <TouchableOpacity onPress={onPress}>
            <Text style={{
                    //  padding: 10,
                    fontSize: 25,
                    // height: 44,
                    color: "#1a8cff",
                    flex: 1,
                }}>{item.studentName}</Text>
            
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
                <FlatList
                    data={listOfSubmitter}
                    renderItem={renderItem}
                    ListEmptyComponent={myListEmpty}
                    keyExtractor={(item) => item.studentID}
                    ItemSeparatorComponent={renderSeparator}
                />
                 {modalVisible===true?
                
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
                            <Text style={[styles.modalText, { marginBottom: 10 }]}>Student Name: {studentName}</Text>
                            
                            <Pressable style={[styles.addBtn, { marginBottom: 50 }]} onPress={downloadFile}><Text style={{ color: "blue", fontSize: 20 }}>Download
                                <MaterialIcons name="file-download" size={20} color="black"></MaterialIcons>
                            </Text></Pressable>

                            {/* <Pressable style={styles.addBtn} onPress={handleUpload}><Text style={{ color: "blue", fontSize: 20 }}>Upload Your File
                                <MaterialIcons name="file-upload" size={20} color="black"></MaterialIcons>
                            </Text></Pressable> */}
                           
                            <Text style={[styles.modalText, { marginBottom: 10 }]}>Grade:
                           
                             </Text>
                              <TextInput style={styles.input} keyboardType='numeric' onChangeText={(text) => setStudentGrade(text)}></TextInput>
                            <Text style={[styles.modalText, { marginBottom: 10 }]} >Comments: {}
                             </Text>
                             <TextInput style={styles.input} multiline={true} onChangeText={ (text)=>setComment(text)}></TextInput>
                            <Pressable style={[styles.button, { backgroundColor: "green" }]} onPress={handleSubmit}><Text style={styles.text}>Submit</Text></Pressable>

                        </View>
                    </View>
                </Modal> : console.log("false")}
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
        backgroundColor: "#e6e6e6",
        borderWidth: 1,
        borderColor: "black",
        padding: 5,
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
        width: '95%',
        marginVertical: 15,
    },
    input: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#8e93a1",
        marginBottom: 30,
        minWidth: "50%"
    },
})

export default Submitters;