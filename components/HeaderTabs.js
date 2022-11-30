import { TouchableOpacity, SafeAreaView } from "react-native";
import React, { useContext } from "react";
import { AuthContext } from "../context/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";


const HeaderTabs = () => {
    const [state, setState] = useContext(AuthContext)

    const SignOut = async () => {
        setState({ token: "", user: null })
        await AsyncStorage.removeItem("auth-rn").catch(err=>err)
    }

    return (
        <SafeAreaView>
            <TouchableOpacity onPress={SignOut}>
                <FontAwesome5 name="sign-out-alt" size={25} color="darkmagenta" />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default HeaderTabs