import React, { useContext } from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import SignIn from "../client/SignIn"
import SignUp from "../client/SignUp"
import Home from "../client/Home"
import { AuthContext } from "../context/auth"
import HeaderTabs from './HeaderTabs'
import Account from "../client/Account"

const Stack = createNativeStackNavigator();

const NavigationScreen = () => {
    const [state, setState] = useContext(AuthContext);
    const authenticated = state && state.token !== "" && state.user !== null;
    console.log(authenticated)
    return (
        <Stack.Navigator initialRouteName="SignIn">
            {authenticated ? (
                <Stack.Group>
                    <Stack.Screen name="Home" component={Home} options={{ headerRight: () => <HeaderTabs /> }} />
                    <Stack.Screen name="Account" component={Account} />
                </Stack.Group>
            ) : (
                <Stack.Group screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="SignIn" component={SignIn} />
                    <Stack.Screen name="SignUp" component={SignUp} />
                </Stack.Group>
            )}
        </Stack.Navigator>
    )
}

export default NavigationScreen