import { router } from 'expo-router';
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from "../Firebase-config";

const CreateProfile = () => {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = async () => {
  if (!username || !age || !position) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert("User not authenticated.");
      return;
    }

    await setDoc(doc(db, "users", userId), {
      username,
      age: parseInt(age),
      position,
    });

    alert("Profile created successfully!");
    router.replace("/(tabs)/home");
  } catch (error) {
    console.error("Error creating profile:", error);
    alert("Error saving profile. Please try again.");
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <Text style={styles.title}>Create Your Profile</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <TextInput
          style={styles.input}
          placeholder="Preferred Position"
          placeholderTextColor="#888"
          value={position}
          onChangeText={setPosition}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});