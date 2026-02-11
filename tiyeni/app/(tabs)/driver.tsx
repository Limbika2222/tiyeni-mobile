import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'

import { auth, db } from '@/src/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function DriverTab() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [isRegisteredDriver, setIsRegisteredDriver] = useState<boolean | null>(null)

  // 🔁 Re-check every time tab is focused
  useFocusEffect(
    useCallback(() => {
      checkDriverStatus()
    }, [])
  )

  const checkDriverStatus = async () => {
    setLoading(true)

    const user = auth.currentUser

    if (!user) {
      setIsRegisteredDriver(false)
      setLoading(false)
      return
    }

    try {
      const driverRef = doc(db, 'drivers', user.uid)
      const driverSnap = await getDoc(driverRef)

      if (driverSnap.exists()) {
        setIsRegisteredDriver(true)
      } else {
        setIsRegisteredDriver(false)
      }
    } catch (error) {
      console.log('Driver check error:', error)
      setIsRegisteredDriver(false)
    }

    setLoading(false)
  }

  // 🔄 Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8BC34A" />
      </View>
    )
  }

  // ❌ Not registered
  if (!isRegisteredDriver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Driver access</Text>

        <Text style={styles.message}>
          You are not registered as a driver.
        </Text>

        <Text style={styles.subMessage}>
          Register to start offering trips and earn money.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)/register-driver')}
        >
          <Text style={styles.buttonText}>Register as Driver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // ✅ Registered driver
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Dashboard</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/(tabs)/driver-home')}
      >
        <Text style={styles.buttonText}>Go to Driver Home</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4D3',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#263238',
    textAlign: 'center',
    marginBottom: 12,
  },

  message: {
    fontSize: 16,
    color: '#263238',
    textAlign: 'center',
    marginBottom: 6,
  },

  subMessage: {
    fontSize: 14,
    color: '#607D8B',
    textAlign: 'center',
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#8BC34A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
