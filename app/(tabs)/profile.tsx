import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { auth, db } from "../../Firebase-config";

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        console.log("No profile found");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Profile</Text>
      <Text>Username: {profile?.username}</Text>
      <Text>Age: {profile?.age}</Text>
      <Text>Preferred Position: {profile?.position}</Text>
    </View>
  );
};

export default Profile;