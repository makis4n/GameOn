import { getAuth } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from '../../Firebase-config';

export default function createListing() {
    const [task, setTask] = useState('');
  const [listing, setListing] = useState<any>([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const todosCollection = collection(db, 'listings');

useEffect(() => {
    fetchListings();
  }, [user]);

  const fetchListings = async () => {
    if (user) {
      const q = query(todosCollection, where("userId", "==", user.uid));
      const data = await getDocs(q);
      setListing(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } else {
      console.log("No user logged in");
    }
  };

  const addListing = async () => {
    if (user) {
      await addDoc(todosCollection, { task, completed: false, userId: user.uid });
      setTask('');
      fetchListings();
    } else {
      console.log("No user logged in");
    }
  };

  const updateListing = async (id: string, completed: any) => {
    const listingDoc = doc(db, 'listings', id);
    await updateDoc(listingDoc, { completed: !completed });
    fetchListings();
  };

  const deleteListing = async (id: string) => {
    const listingDoc = doc(db, 'listings', id);
    await deleteDoc(listingDoc);
    fetchListings();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Listings</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Opposing Team Name"
            value={task}
            onChangeText={(text) => setTask(text)}
            style={styles.input}
          />
          <TouchableOpacity style={styles.addButton} onPress={addListing}>
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={listing}
          renderItem={({ item }) => (
            <View style={styles.todoContainer}>
              <Text style={{ textDecorationLine: item.completed ? 'line-through' : 'none', flex: 1 }}>{item.task}</Text>
              <TouchableOpacity style={styles.button} onPress={() => updateListing(item.id, item.completed)}>
                <Text style={styles.buttonText}>{item.completed ? "Undo" : "Complete"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => deleteListing(item.id)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10, // Adjust spacing as needed
    color: '#333', // Choose a color that fits your app theme
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    flex: 1, // Adjusted to take available space
    marginRight: 10, // Add margin to separate input and button
  },
  addButton: {
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFA726', // Use a distinct color for the add button
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  todoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  button: {
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5C6BC0',
    shadowColor: '#5C6BC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
    marginLeft: 10,
  },
});