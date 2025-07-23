const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document("notifications/{notifId}")
  .onCreate(async (snap, context) => {
    const notif = snap.data();

    const toUserId = notif.to;
    if (!toUserId) return;

    const userDoc = await admin.firestore().doc(`users/${toUserId}`).get();
    const pushToken = userDoc.data()?.expoPushToken;

    if (!pushToken || !pushToken.startsWith("ExponentPushToken")) {
      console.log("Invalid or missing Expo push token");
      return;
    }

    const message = {
      to: pushToken,
      title: notif.title || "New Notification",
      body: notif.message || "You have a new message",
      sound: "default",
    };

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const data = await response.json();
      console.log("Expo push response:", data);
    } catch (error) {
      console.error("Push notification error:", error);
    }
  });
