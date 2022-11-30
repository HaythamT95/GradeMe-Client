import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './client/SignUp'
import SignIn from './client/SignIn'
import Home from './client/Home'
import Account from './client/Account';
import axios from "axios"
import { HOST } from "./models/network"
import { AuthProvider } from './context/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'
import HeaderTabs from './components/HeaderTabs'

const Stack = createNativeStackNavigator();

export default function App() {

  const checkConnection = async () => {

    const resp = await axios.get(`http://${HOST}:8000/hello`).catch(err=>err)
    if (resp.data.error) {
      console.log(resp.data.error)
      return
    }
    console.log("connection success")
  }

  const removeAppKeys = async () => {
    let keys = []
    try {
      keys = await AsyncStorage.getAllKeys()
      console.log(`Keys: ${keys}`) // Just to see what's going on
      await AsyncStorage.multiRemove(keys)
    } catch(e) {
     console.log(e)
    }
    console.log('Done')
  }
  checkConnection();
  return (
   // <Navigation/>
    <NavigationContainer>
      <AuthProvider>
        <Stack.Navigator initialRouteName='SignIn'>
          <Stack.Screen name="SignUp" component={SignUp}></Stack.Screen>
          <Stack.Screen name="SignIn" component={SignIn}></Stack.Screen>
          <Stack.Screen name="Home" component={Home} options={{ headerRight: () => <HeaderTabs /> }}></Stack.Screen>
          <Stack.Screen name="Account" component={Account} />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>

    // <SignUp/>
    /*
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
    */
  );
}


const styles = StyleSheet.create({
  layout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
  },
});
