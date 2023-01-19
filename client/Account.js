import { StyleSheet, Text, SafeAreaView, View, Image, Alert, TouchableOpacity } from "react-native"
import FooterList from "../components/FooterList"
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import axios from "axios"
import { HOST } from "../models/network"

const Account = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [image, setImage] = useState('');

    const uploadImage = async (picType) => {

        const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
        const dataParsed = JSON.parse(data)
        const list = dataParsed.user.listOfCourses
        //console.log(dataParsed)

        const formData = new FormData();

        formData.append('image', {
            name: 'image.' + picType,
            uri: image,
            type: 'image/' + picType, // mime type of file
        });
        formData.append('userid', dataParsed.user._id)
        //console.log(formData)
        
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (data) => {
                return data
            }
        };
        const response = await axios.post(`${HOST}/uploadImage`, formData, config).then(res => {
            alert("Upload success");
        }).catch(err => { alert("Upload failed, Try again") });
    }

    const chooseImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
            //console.log(permissionResult)
            if (permissionResult.granted === false) {
                alert("You've refused to allow this appp to access your photos!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3]
            });
            if (result.cancelled === true) {
                return;
            }
            let picType = result.uri.split('.');


            if (!result.cancelled) {
                setImage(result.uri);
                uploadImage(picType[picType.length - 1])
            }
        } catch (error) {
            //console.error(error);
            Alert.alert('Error', 'An error occurred while choosing the image');
        }
    };

    const getUserData = async () => {
        const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
        const dataParsed = JSON.parse(data)
        setName(dataParsed.user.name);
        setEmail(dataParsed.user.email);
        setRole(dataParsed.user.role);

        try {
            const resp = await axios.get(`${HOST}/getImageOfUser/${dataParsed.user._id}`).then(response => {
                const imageData = `data:image/jpeg;base64,${response.data}`
                setImage(imageData)
            })
        }
        catch (e) { console.log(e) }
    }

    useEffect(() => {
        getUserData()
    },[])

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.mainText}>Details</Text>
                {image ? (
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={chooseImage} style={{ paddingTop: 20 }}>
                            <Image style={styles.avatar} source={{ uri: image }} />
                            <FontAwesome5Icon size={20} name="camera" style={{ alignSelf: 'center' }}></FontAwesome5Icon>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={chooseImage} style={{ paddingTop: 20 }}>
                            <Image source={require("../assets/blank-profile-pic.png")} style={styles.avatar} />
                            <FontAwesome5Icon size={20} name="camera" style={{ alignSelf: 'center' }}></FontAwesome5Icon>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.text}>Name: {name}</Text>
                <Text style={styles.text}>Email: {email}</Text>
                <Text style={styles.text}>Role: {role}</Text>
            </View>
            <FooterList />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    mainText: { fontSize: 30, textAlign: "center" },
    avatar: {
        height: 150,
        width: 150,
        borderRadius: 100,
        padding: 20,
    },
    text: {
        fontSize: 20,
        marginTop: "10%",
        marginLeft: "5%"
    }
})

export default Account