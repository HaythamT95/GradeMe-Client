import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, Text, View, ActivityIndicator } from "react-native"
import React, { useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from "axios"
import { HOST } from "../models/network"
import FooterList from '../components/FooterList.js'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default function Home({ navigation }) {
    const [course, setCourse] = useState([])
    const [selectedId, setSelectedId] = useState(null);
    const [loading, isLoading] = useState(null)

    const courses = async () => {
        try {
            const data = await AsyncStorage.getItem("auth-rn").catch(err => err);
            const dataParsed = JSON.parse(data)
            const list = dataParsed.user.listOfCourses
            const resp = axios.get(`${HOST}/getCourses`, { params: { 'list': list } }).then((resJson) => {
                const dbData = Object.values(resJson.data)
                setCourse(dbData)
                isLoading(true)
            }).catch(err => err);
        }
        catch (e) {
            return null;
        }
    }
    useEffect(() => {
        courses();
    }, []);

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}>No Courses Found</Text>
            </View>
        );
    };

    const Item = ({ item, onPress, backgroundColor }) => (
        <TouchableOpacity onPress={onPress}>
            <View style={[styles.item, backgroundColor]}>
                <Text style={[styles.title]}>{item.courseName}</Text>
                <FontAwesome5 name="angle-right" size={25} color="white" />
            </View>
        </TouchableOpacity>
    );

    if (!loading) {
        return (
            <ActivityIndicator
                animating={true}
                style={styles.indicator}
                size="large"
            />
        );
    }
    const renderItem = ({ item }) => {
        const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#5669FF";

        return (
            <Item
                item={item}
                onPress={() => {
                    setSelectedId(item.courseID);
                    navigation.navigate({
                        name: 'Course',
                        params: { courseID: item.courseID },
                    });
                }}
                backgroundColor={{ backgroundColor }}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>
                <FlatList
                    data={course}
                    renderItem={renderItem}
                    ListEmptyComponent={myListEmpty}
                    keyExtractor={(item) => item.courseID}
                    ListHeaderComponent={() => (
                        <Text style={{ fontSize: 30, textAlign: "center", marginTop: 10, marginBottom: 10, fontWeight: 'bold' }}>
                            My Courses
                        </Text>
                    )}
                />
            </View>
            <FooterList />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    mainText: { fontSize: 30, textAlign: "center" },
    item: {
        flex: 1,
        backgroundColor: '#3066be',
        borderRadius: 15,
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: 'row',
        justifyContent:'space-between'
    },
    title: {
        fontSize: 32,
        color: "white"
    },
})
