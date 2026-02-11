import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { auth, db } from '@/src/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function DriverHome() {
  const router = useRouter()
  const [driverName, setDriverName] = useState<string>('')

  useEffect(() => {
    const loadDriver = async () => {
      const user = auth.currentUser
      if (!user) return

      const driverRef = doc(db, 'drivers', user.uid)
      const driverSnap = await getDoc(driverRef)

      if (driverSnap.exists()) {
        const data = driverSnap.data()
        setDriverName(data.fullName || '')
      }
    }

    loadDriver()
  }, [])

  const handleLogout = async () => {
    await auth.signOut()
    router.replace('/login')
  }

  const handleCreateTrip = () => {
    router.push('/create-trip')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Dashboard</Text>

      <Text style={styles.welcome}>
        Welcome {driverName || 'Driver'}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreateTrip}
      >
        <Text style={styles.buttonText}>Create Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logout]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4D3',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },

  welcome: {
    fontSize: 16,
    marginBottom: 30,
  },

  button: {
    backgroundColor: '#8BC34A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 16,
  },

  logout: {
    backgroundColor: '#F44336',
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
})
