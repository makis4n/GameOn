import { Stack }  from 'expo-router';

export default function listingsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="playerListing"
                options={{
                headerShown: true,
                title: "",
                headerBackTitle: "Back",
                }}
            />
            <Stack.Screen
                name="gameListing"
                options={{
                headerShown: true,
                title: "",
                headerBackTitle: "Back",
                }}
            />
        </Stack>

    );
    }