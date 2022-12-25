import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './client/SignUp'
import SignIn from './client/SignIn'
import Home from './client/Home'
import Account from './client/Account';
import Course from './client/Course';
import Submitters from './client/Submitters';
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
    console.log(resp.data)
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
          <Stack.Screen name="Course" component={Course} />
          <Stack.Screen name="Account" component={Account} />
          <Stack.Screen name="Submitters" component={Submitters} />
        </Stack.Navigator>
      </AuthProvider>
    </NavigationContainer>

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
