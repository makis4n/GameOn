import axios from "axios";

type PushNotificationData = {
  [key: string]: any;
};

export async function sendPushNotification(
  expoPushToken: string | null,
  title: string,
  message: string,
  data: PushNotificationData = {}
): Promise<void> {
  if (
    typeof expoPushToken !== "string" ||
    !expoPushToken.startsWith("ExponentPushToken")
  ) {
    console.warn("Invalid or missing Expo push token:", expoPushToken);
    return;
  }

  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title,
      body: message,
      data,
    });
    console.log("Push notification sent:", response.data);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
