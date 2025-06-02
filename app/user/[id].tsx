import { db } from "@/Firebase-config";
import { useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const UserProfile = () => {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || typeof id !== "string") {
        console.warn("Invalid user ID");
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          console.log("No profile found for this ID");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <ActivityIndicator />;

  if (!profile) return <Text style={{ padding: 20 }}>User not found.</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>User Profile</Text>
      <Text>Username: {profile.username}</Text>
      <Text>Age: {profile.age}</Text>
      <Text>Preferred Position: {profile.position}</Text>
    </View>
  );
};

export default UserProfile;
