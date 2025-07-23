import axios from "axios";

type PushNotificationData = {
  [key: string]: any;
};

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  message: string,
  data: PushNotificationData = {}
): Promise<void> {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
    console.warn("Invalid Expo push token:", expoPushToken);
    return;
  }

  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title,
      body: message,
      data,
    });
    console.log("Push notification sent!");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
