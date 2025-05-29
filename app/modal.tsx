import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>This is a Modal!</Text>
      <Button title="Close Modal" onPress={() => router.back()} />
    </View>
  );
}