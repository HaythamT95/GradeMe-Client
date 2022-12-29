import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios"
import { HOST } from "../models/network"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/auth'
import {screenWidth,screenHeight} from './styling'

const SignIn = ({ navigation }) => {
    //const [email, setEmail] = useState("haytham_r10_r9@hotmail.com");
    //const [password, setPassword] = useState("haytham123");
    const [email, setEmail] = useState("alex@gmail.com");
    const [password, setPassword] = useState("alex123");
    const [showRequiredFields, SetShowRequiredFields] = useState(false)
    const [state, setState] = useState(AuthContext)
    const { courses, setCourses } = useState(AuthContext)
    console.log(screenHeight)

    useEffect(() => {

    })

    const handleSubmit = async () => {

        //setEmail("alex@gmail.com")
        //setPassword("alex123")

        if (email === '' || password === '') {
            //alert("All fields are required");
            SetShowRequiredFields(true)
            return;
        }
        const resp = await axios.post(`http://${HOST}:8000/api/signin`, { email, password }).catch(err => console.log(err));
        if (resp.data.error)
            alert(resp.data.error)
        else {
            setState(resp.data)
            console.log(resp.data)
            SetShowRequiredFields(false)
            await AsyncStorage.setItem("auth-rn", JSON.stringify(resp.data)).catch(err => err)
            navigation.navigate('Home')
        }
    };

    return (
        <KeyboardAwareScrollView contentCotainerStyle={styles.container}>
            <View style={{ marginVertical: 100 }}>
                <View style={styles.imageContainer}>
                    <Image source={require("../assets/moodle-ladders.jpg")} style={styles.imageStyles} />
                </View>
                <Text style={styles.signupText}>Sign In</Text>
                <View style={{ marginHorizontal: 24 }}>
                    <Text style={{ fontSize: 16, color: '#8e93a1' }}>EMAIL
                        {showRequiredFields ? <Text style={{ color: "darkred", fontWeight: "bold", fontSize: 12 }}> *</Text> : console.log("")}
                    </Text>
                    <TextInput style={styles.signupInput} value={email} onChangeText={text => setEmail(text)} autoCompleteType="email" keyboardType="email-address" />
                </View>
                <View style={{ marginHorizontal: 24 }}>
                    <Text style={{ fontSize: 16, color: '#8e93a1' }}>PASSWORD
                        {showRequiredFields ? <Text style={{ color: "darkred", fontWeight: "bold", fontSize: 12 }}> *</Text> : console.log("")}
                    </Text>
                    <TextInput style={styles.signupInput} value={password} onChangeText={text => setPassword(text)} secureTextEntry={true} autoComplteType="password" />
                </View>
                <TouchableOpacity onPress={handleSubmit} style={styles.buttonStyle}>
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
                {showRequiredFields ? <Text style={{ color: "darkred", fontWeight: "bold", fontSize: 12, textAlign: 'center', marginTop: 10 }}>Please fill out all required fields*</Text> : console.log("")}

            </View>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    signupText: {
        fontSize: 30,
        textAlign: 'center'
    },
    signupInput: {
        borderBottomWidth: 0.5,
        height: 48,
        borderBottomColor: "#8e93a1",
        marginBottom: 30,
    },
    buttonStyle: {
        backgroundColor: "#5669FF",
        height: 50,
        marginBottom: 20,
        justifyContent: "center",
        marginHorizontal: 15,
        borderRadius: 15,
    },
    buttonText: {
        fontSize: 20,
        textAlign: 'center',
        color: '#fff',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    imageContainer: { justifyContent: "center", alignItems: "center" },
    imageStyles: { width: screenWidth*(95/100), height: screenHeight*(1/3), marginBottom: 10 }
})

export default SignIn