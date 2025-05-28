
import "react-native-reanimated"

import { SafeAreaView } from 'react-native';
import '../global.css';
import { router, Stack } from "expo-router";

import useAuthStore from '~/store/authStore';
import { useEffect } from "react";

export default function Layout() {
	const { user } = useAuthStore();

	useEffect(() => {
		if (!user) {
			router.replace('/login');
		} else {
			router.replace('/(tabs)');
		}
	}, [user]);

	return (
		<SafeAreaView className='flex-1'>
			<Stack screenOptions={{
				headerShown: false
			}}>
				<Stack.Screen name='index' />
				<Stack.Screen name='/(tabs)' />
				<Stack.Screen name='login' />
			</Stack>
		</SafeAreaView>
	);
}
