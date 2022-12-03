import React, { useEffect, useState } from 'react'
import axios from "axios"
import { HOST } from "../models/network"
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native'
import CourseClass from '../models/CourseClass'

const Course = ({ navigation, route }) => {
    const [course, setCourse] = useState([])
    const [loading, isLoading] = useState(null)

    const courseDetails = async (courseID) => {
        try {
            const resp = axios.get(`http://${HOST}:8000/getCourse`, { params: { 'courseID': courseID } }).then((resJson) => {
                const dbData = Object.values(resJson.data)
                setCourse(dbData)
                isLoading(true)
            }).catch(err => err);
        }
        catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        courseDetails(route.params?.courseID);
    }, []);

    if (!loading) {
        return (
            <ActivityIndicator
                animating={true}
                style={styles.indicator}
                size="large"
            />
        );
    }
    return (
        <SafeAreaView style={styles.container}>
            <View>
                <Text style={styles.mainText}>{course[0].courseName}</Text>
                <Pressable style={styles.button}>
                    <Text style={styles.text}>Exercises</Text>
                </Pressable>
                <Pressable style={styles.button}>
                    <Text style={styles.text}>laboratories</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "space-between" },
    mainText: {
        fontSize: 30,
        textAlign: "left",
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    indicator: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 5,
        elevation: 3,
        backgroundColor: '#3066be',
        width: '95%',
        marginVertical: 15,
      },
      text: {
        fontSize: 20,
        lineHeight: 21,
        fontWeight: 'bold',
        letterSpacing: 0.25,
        color: 'white',
      },
})

export default Course