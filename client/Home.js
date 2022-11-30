import { SafeAreaView, StyleSheet, Text } from "react-native"
import React, { useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthContext } from '../context/auth.js'
import SignIn from "./SignIn"
import FooterList from '../components/FooterList.js'

const Home = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.mainText}>Home</Text>
            <FooterList/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    mainText: { fontSize: 30, textAlign: "center" }
})

export default Home;