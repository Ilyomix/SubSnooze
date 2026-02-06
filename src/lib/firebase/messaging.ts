"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(firebaseConfig.projectId && firebaseConfig.apiKey)

// Initialize Firebase only if configured
export const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null

// Get messaging instance (only available in browser)
let messaging: Messaging | null = null

export function getMessagingInstance(): Messaging | null {
  if (typeof window === "undefined") return null
  if (!app) return null // Firebase not configured

  if (!messaging) {
    try {
      messaging = getMessaging(app)
    } catch (error) {
      console.error("Failed to initialize Firebase Messaging:", error)
      return null
    }
  }

  return messaging
}

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined") return null

  // Check if notifications are supported
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications")
    return null
  }

  // Request permission
  const permission = await Notification.requestPermission()

  if (permission !== "granted") {
    console.warn("Notification permission denied")
    return null
  }

  // Get FCM token
  const messagingInstance = getMessagingInstance()
  if (!messagingInstance) return null

  try {
    // Register service worker with Firebase config passed as query params.
    // Service workers in /public cannot access process.env, so we pass the
    // config values (which are public Firebase keys) via the registration URL.
    const swParams = new URLSearchParams({
      apiKey: firebaseConfig.apiKey || "",
      authDomain: firebaseConfig.authDomain || "",
      projectId: firebaseConfig.projectId || "",
      storageBucket: firebaseConfig.storageBucket || "",
      messagingSenderId: firebaseConfig.messagingSenderId || "",
      appId: firebaseConfig.appId || "",
    })
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${swParams.toString()}`
    )

    const token = await getToken(messagingInstance, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    })

    return token
  } catch (error) {
    console.error("Error getting FCM token:", error)
    return null
  }
}

// Check if notifications are enabled
export function getNotificationPermissionStatus(): NotificationPermission | null {
  if (typeof window === "undefined") return null
  if (!("Notification" in window)) return null
  return Notification.permission
}

// Listen for foreground messages
export function onForegroundMessage(callback: (payload: unknown) => void) {
  const messagingInstance = getMessagingInstance()
  if (!messagingInstance) return () => {}

  return onMessage(messagingInstance, (payload) => {
    callback(payload)
  })
}

// Show a notification in the browser
export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined") return
  if (Notification.permission !== "granted") return

  new Notification(title, options)
}
