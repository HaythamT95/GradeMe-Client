import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './client/SignIn'
import Home from './client/Home'
import Account from './client/Account';
import Course from './client/Course';
import Submitters from './client/Submitters';
import axios from "axios"
import { HOST } from "./models/network"
import { AuthContext, AuthProvider } from './context/auth';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const Stack = createNativeStackNavigator();

export default function App() {
  // const [state, setState] = useContext(AuthContext);
  // const authenticated = state && state.token !== "" && state.user !== null;

  const image = require("./assets/moodle-logo.png")
  function LogoTitle() {
    return (
      <Image
        style={{ width: 50, height: 50 }}
        source={image}
      />
    );
  }

  const checkConnection = async () => {

    const resp = await axios.get(`${HOST}/hello`).catch(err => err)
    if (resp.data.error) {
      console.log(resp.data.error)
      return
    }
    console.log(resp.data)
  }

  checkConnection();
  return (
    //<Navigation></Navigation>
    <NavigationContainer>
      <AuthProvider>
        <Stack.Navigator initialRouteName='SignIn'>
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignIn} ></Stack.Screen>
          </Stack.Group>
          <Stack.Screen name="Home" component={Home} options={({ navigation }) => ({
            headerTitle: (props) => <LogoTitle {...props} />,
            headerRight: () => (
              <FontAwesome5 name="sign-out-alt" size={25} color="black" onPress={() => navigation.navigate("SignIn")} />
            ),
            headerBackVisible: false,
          })}></Stack.Screen>
          <Stack.Screen name="Course" component={Course} />
          <Stack.Screen name="Account" component={Account} options={{headerBackVisible: false}}/>
          <Stack.Screen name="Submitters" component={Submitters}/>
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
