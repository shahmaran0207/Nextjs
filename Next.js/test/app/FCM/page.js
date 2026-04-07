'use client'

import React, { useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage, getToken } from 'firebase/messaging'
 
const Index = () => {
 
  const onMessageFCM = async () => {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return 
 
    const firebaseApp = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOAMIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    });

    const messaging = getMessaging(firebaseApp)
 
    getToken(messaging, { vapidKey: '' }).then((currentToken) => {
      if (currentToken) {
        console.log(currentToken)
      } else {
        console.log('No registration token available. Request permission to generate one.')
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err)
    })
 
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload)
    })
  }
 
  useEffect(() => {
    onMessageFCM()
  }, [])
 
  return (
    <div>
      <h1>hello world</h1>
    </div>
  )
}
 
export default Index