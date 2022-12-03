import { StyleSheet, Text, SafeAreaView } from "react-native"
import FooterList from "../components/FooterList"
import React,{useContext,useEffect,useState} from "react";
import { AuthContext } from "../context/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Account = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const getUserData = async () => {
        const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
        const dataParsed=JSON.parse(data)
        setName(dataParsed.user.name);
        setEmail(dataParsed.user.email);
        setRole(dataParsed.user.role);
    }
    getUserData()
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.mainText}>Details</Text>
            <Text>Hello,{name}</Text>
            <Text>Your email:{email}</Text>
            <Text>Role:{role}</Text>
            <FooterList />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    mainText: { fontSize: 30, textAlign: "center" }
})

export default Account