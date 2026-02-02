// Shared FCM utilities for Edge Functions

const FCM_API_URL = "https://fcm.googleapis.com/fcm/send"

interface FCMNotification {
  title: string
  body: string
  icon?: string
  click_action?: string
}

interface FCMMessage {
  to: string
  notification: FCMNotification
  data?: Record<string, string>
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  const serverKey = Deno.env.get("FIREBASE_SERVER_KEY")

  if (!serverKey) {
    console.error("FIREBASE_SERVER_KEY not set")
    return false
  }

  const message: FCMMessage = {
    to: fcmToken,
    notification: {
      title,
      body,
      icon: "/icon-192.png",
      click_action: "/",
    },
    data,
  }

  try {
    const response = await fetch(FCM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${serverKey}`,
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("FCM error:", errorText)
      return false
    }

    const result = await response.json()
    return result.success === 1
  } catch (error) {
    console.error("Failed to send push notification:", error)
    return false
  }
}
