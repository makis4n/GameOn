import { Stack }  from 'expo-router';

export default function teamId() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: true,
                title: '',
                headerBackTitle: 'Back',
                }}
            />
        </Stack>

    );
    }