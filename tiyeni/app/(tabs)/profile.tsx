import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
  UIManager,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { auth, db } from '@/src/firebase'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore'
import * as ImagePicker from 'expo-image-picker'
import { uploadToCloudinary } from '@/src/utils/uploadToCloudinary'

/* Enable LayoutAnimation on Android */
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [type, setType] = useState('')
  const [color, setColor] = useState('')
  const [seats, setSeats] = useState('')
  const [carImage, setCarImage] = useState<string | null>(null)
  const [carBase64, setCarBase64] = useState<string | null>(null)

  /* ================= REALTIME VEHICLES ================= */

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const vehiclesRef = collection(db, 'drivers', user.uid, 'vehicles')

    const unsub = onSnapshot(vehiclesRef, (snapshot) => {
      const list: any[] = []
      snapshot.forEach((doc) =>
        list.push({ id: doc.id, ...doc.data() })
      )
      setVehicles(list)
      setLoading(false)
    })

    return unsub
  }, [])

  /* ================= ANIMATED TOGGLE ================= */

  const toggleForm = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut
    )
    setShowForm(!showForm)
  }

  /* ================= IMAGE PICKER ================= */

  const pickVehicleImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) return

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    })

    if (result.canceled) return

    const asset = result.assets[0]
    setCarImage(asset.uri)
    if (asset.base64) setCarBase64(asset.base64)
  }

  /* ================= ADD VEHICLE ================= */

  const addVehicle = async () => {
    if (submitting) return
    setSubmitting(true)

    const user = auth.currentUser
    if (!user) return

    if (!type || !color || !seats) {
      setSubmitting(false)
      return
    }

    let imageUrl = ''

    if (carBase64) {
      imageUrl = await uploadToCloudinary(
        `data:image/jpeg;base64,${carBase64}`
      )
    }

    await addDoc(
      collection(db, 'drivers', user.uid, 'vehicles'),
      {
        type,
        color,
        seats: Number(seats),
        carImage: imageUrl,
        isDefault: vehicles.length === 0,
        createdAt: serverTimestamp(),
      }
    )

    /* RESET FORM */
    setType('')
    setColor('')
    setSeats('')
    setCarImage(null)
    setCarBase64(null)
    setShowForm(false)
    Keyboard.dismiss()
    setSubmitting(false)
  }

  /* ================= DELETE ================= */

  const deleteVehicle = async (id: string) => {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'drivers', user.uid, 'vehicles', id))
  }

  /* ================= SET DEFAULT ================= */

  const setDefaultVehicle = async (vehicleId: string) => {
    const user = auth.currentUser
    if (!user) return

    const snapshot = await getDocs(
      collection(db, 'drivers', user.uid, 'vehicles')
    )

    const updates = snapshot.docs.map((docSnap) =>
      updateDoc(
        doc(db, 'drivers', user.uid, 'vehicles', docSnap.id),
        { isDefault: docSnap.id === vehicleId }
      )
    )

    await Promise.all(updates)
  }

  /* ================= UI ================= */

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>My Vehicles</Text>

            {/* ADD BUTTON */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={toggleForm}
            >
              <Text style={styles.buttonText}>
                {showForm ? 'Cancel' : '+ Add Vehicle'}
              </Text>
            </TouchableOpacity>

            {/* FORM */}
            {showForm && (
              <View style={styles.formCard}>
                <TextInput
                  placeholder="Vehicle Type"
                  style={styles.input}
                  value={type}
                  onChangeText={setType}
                />

                <TextInput
                  placeholder="Color"
                  style={styles.input}
                  value={color}
                  onChangeText={setColor}
                />

                <TextInput
                  placeholder="Seats"
                  style={styles.input}
                  keyboardType="numeric"
                  value={seats}
                  onChangeText={setSeats}
                />

                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={pickVehicleImage}
                >
                  {carImage ? (
                    <Image
                      source={{ uri: carImage }}
                      style={styles.preview}
                    />
                  ) : (
                    <Text>Upload Image</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    submitting && { opacity: 0.6 },
                  ]}
                  onPress={addVehicle}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>
                    {submitting ? 'Saving...' : 'Save Vehicle'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* VEHICLES */}
            {vehicles.map((item) => (
              <View key={item.id} style={styles.vehicleCard}>
                {item.carImage && (
                  <Image
                    source={{ uri: item.carImage }}
                    style={styles.vehicleImage}
                  />
                )}

                <View style={{ flex: 1 }}>
                  <Text style={styles.vehicleTitle}>
                    {item.type}
                  </Text>
                  <Text>{item.color}</Text>
                  <Text>{item.seats} seats</Text>
                </View>

                <View>
                  <TouchableOpacity
                    onPress={() => setDefaultVehicle(item.id)}
                  >
                    <Text style={styles.defaultText}>
                      {item.isDefault
                        ? '✓ Default'
                        : 'Set Default'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteVehicle(item.id)}
                  >
                    <Text style={styles.deleteText}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: '#EAF4D3',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#8BC34A',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  input: {
    backgroundColor: '#F4F4F4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  uploadBox: {
    height: 110,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  vehicleImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  vehicleTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  defaultText: {
    color: '#4CAF50',
    marginBottom: 6,
  },
  deleteText: {
    color: 'red',
  },
})
