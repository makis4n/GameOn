import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../../Firebase-config';

export default function TabOneScreen() {
    getAuth().onAuthStateChanged((user) => {
        if (!user) router.replace('../login');
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Out</Text>
            <TouchableOpacity onPress={() => auth.signOut()}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title : {
        fontSize: 20,
        fontWeight:'bold',
    }
})
