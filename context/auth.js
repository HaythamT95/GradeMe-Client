import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useState, useEffect, createContext } from 'react'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        token: ""
    })

    useEffect(() => {
        const loadFromAsyncStorage = async () => {
            try {
                let data = await AsyncStorage.getItem("auth-rn").catch(err => err)
                const parsed = JSON.parse(data)
                setState({ ...state, user: parsed.data, token: parsed.token })
            } catch (err) {
                console.log(err)
            }
        }
        loadFromAsyncStorage()
    }, [])
    return (
        <AuthContext.Provider value={[state, setState]}>
            {children}
        </AuthContext.Provider>
    )
}
export { AuthContext, AuthProvider }