
import "react-native-reanimated"

import { SafeAreaView, StatusBar } from 'react-native';
import '../global.css';
import { Stack } from "expo-router";

export default function Layout() {
	return (
		<SafeAreaView className='flex-1'>
			<Stack screenOptions={{
				headerShown: false
			}}>
				<Stack.Screen name='index' />
				<Stack.Screen name='/(tabs)' />
			</Stack>
		</SafeAreaView>
	);
}
