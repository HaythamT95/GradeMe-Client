import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image,ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios"
import { HOST } from "../models/network"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/auth'
import { screenWidth, screenHeight } from './styling'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const SignIn = ({ navigation }) => {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [showRequiredFields, SetShowRequiredFields] = useState(false)
    const [state, setState] = useState(AuthContext)
    const { courses, setCourses } = useState(AuthContext)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, isLoading] = useState(null)

    useEffect(() => {

    })

    if (loading===true) {
        return (
            <ActivityIndicator
                animating={true}
                style={styles.container}
                size="large"
            />
        );
    }

    const handleSubmit = async () => {
        isLoading(true)
        if (email === '' || password === '') {
            //alert("All fields are required");
            SetShowRequiredFields(true)
            isLoading(false)
            return;
        }
        //const resp = await axios.post(`${HOST}/signin`, { email, password }).catch(err => console.log(err));
        const resps = await axios.post(`${HOST}/signin`, { email, password }).then(async res=>{
            isLoading(false)
            setState(res.data)
            SetShowRequiredFields(false)
            await AsyncStorage.setItem("auth-rn", JSON.stringify(res.data)).catch(err => err)
            navigation.navigate('Home')
        }).catch(err => console.log(err));
        //console.log(resp)
        // if (resp.data.error)
        //     alert(resp.data.error)
        // else {

        //     setState(resp.data)
        //     //console.log(resp.data)
        //     SetShowRequiredFields(false)
        //     await AsyncStorage.setItem("auth-rn", JSON.stringify(resp.data)).catch(err => err)
        //     navigation.navigate('Home')
        // }
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
                        {showRequiredFields ? <Text style={{ color: "darkred", fontWeight: "bold", fontSize: 12 }}> *</Text> : ''}
                    </Text>
                    <TextInput style={styles.signupInput} value={email} onChangeText={text => setEmail(text)} autoCompleteType="email" keyboardType="email-address" />
                </View>
                <View style={{ marginHorizontal: 24 }}>
                    <View style={{ flexDirection:'row',justifyContent:'space-between' }}>
                        <Text style={{ fontSize: 16, color: '#8e93a1' }}>PASSWORD
                            {showRequiredFields ? <Text style={{ color: "darkred", fontWeight: "bold", fontSize: 12 }}> *</Text> : ''}
                        </Text>
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <FontAwesome5 name={showPassword ? "eye-slash" : "eye"} size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                    <TextInput style={styles.signupInput} value={password} onChangeText={text => setPassword(text)} secureTextEntry={!showPassword} autoComplteType="password"/>
                </View>

                <TouchableOpacity onPress={handleSubmit} style={styles.buttonStyle}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
                {showRequiredFields ? <Text style={{ color: "darkred", fontWeight: "bold", fontSize: 12, textAlign: 'center', marginTop: 10 }}>Please fill out all required fields*</Text> : ''}

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
    imageStyles: { width: screenWidth * (95 / 100), height: screenHeight * (1 / 3), marginBottom: 10 }
})

export default SignIn