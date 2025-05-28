import React from 'react'
import { router, Tabs } from 'expo-router'

import { MaterialIcons } from '@expo/vector-icons'
import useAuthStore from '~/store/authStore';

export default function Layout() {
    const { user } = useAuthStore();
    if (!user) {
        router.replace('/')
    }

    return (
        <Tabs screenOptions={{
            headerShown: false,
        }}>
            <Tabs.Screen name='index' 
                options={{
                    tabBarIcon: () => <MaterialIcons name='home' size={24}/>,
                    tabBarLabel: 'Home'
                }}
            />
            <Tabs.Screen name="payments" 
                options={{
                    tabBarIcon: () => <MaterialIcons name='payments' size={24}/>,
                    tabBarLabel: 'Payments'
                }}
            />
            <Tabs.Screen name="vendors" 
                 options={{
                    tabBarIcon: () => <MaterialIcons name='people-alt' size={24}/>,
                    tabBarLabel: 'Payer'
                }}
            />
            <Tabs.Screen name="profile" 
                options={{
                    tabBarIcon: () => <MaterialIcons name='settings' size={24}/>,
                    tabBarLabel: 'Settings'
                }}
            />
        </Tabs>
    )
}