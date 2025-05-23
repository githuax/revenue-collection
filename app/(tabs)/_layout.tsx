import React from 'react'
import { Tabs } from 'expo-router'

import { MaterialIcons } from '@expo/vector-icons'

export default function Layout() {
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