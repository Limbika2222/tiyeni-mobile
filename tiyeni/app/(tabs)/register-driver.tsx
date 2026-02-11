import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import * as ImagePicker from 'expo-image-picker'

import { auth, db } from '@/src/firebase'
import { uploadToCloudinary } from '@/src/utils/uploadToCloudinary'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export default function DriverRegister() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)

  // ================= STEP 1 =================
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | ''>('')
  const [driverCategory, setDriverCategory] =
    useState<'personal' | 'company' | 'business' | ''>('')
  const [companyName, setCompanyName] = useState('')

  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [profileBase64, setProfileBase64] = useState<string | null>(null)

  // ================= STEP 2 =================
  const [vehicleType, setVehicleType] =
    useState<'Car' | 'Minibus' | 'Bus' | ''>('')
  const [seats, setSeats] = useState('')

  const [platePreview, setPlatePreview] = useState<string | null>(null)
  const [plateBase64, setPlateBase64] = useState<string | null>(null)

  const [licensePreview, setLicensePreview] = useState<string | null>(null)
  const [licenseBase64, setLicenseBase64] = useState<string | null>(null)

  // ================= STEP 3 =================
  const [carPreview, setCarPreview] = useState<string | null>(null)
  const [carBase64, setCarBase64] = useState<string | null>(null)
  const [carColor, setCarColor] = useState('')

  // ================= IMAGE PICKER =================
  const pickImage = async (
    previewSetter: (uri: string) => void,
    base64Setter: (b64: string) => void
  ) => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      Alert.alert('Permission required to access photos')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    })

    if (result.canceled) return

    const asset = result.assets[0]

    previewSetter(asset.uri)

    if (asset.base64) {
      base64Setter(asset.base64)
    } else {
      Alert.alert('Error', 'Image could not be processed')
    }
  }

 // EVERYTHING ABOVE STAYS THE SAME

// ================= SUBMIT =================
const submitDriver = async () => {
  if (submitting) return
  setSubmitting(true)

  console.log('SUBMIT PRESSED')

  try {
    const user = auth.currentUser
    if (!user) {
      Alert.alert('Error', 'User not logged in')
      setSubmitting(false)
      return
    }

    console.log('Uploading images...')

    const profileUrl = profileBase64
      ? await uploadToCloudinary(
          `data:image/jpeg;base64,${profileBase64}`
        )
      : ''

    const plateUrl = plateBase64
      ? await uploadToCloudinary(
          `data:image/jpeg;base64,${plateBase64}`
        )
      : ''

    const licenseUrl = licenseBase64
      ? await uploadToCloudinary(
          `data:image/jpeg;base64,${licenseBase64}`
        )
      : ''

    const carUrl = carBase64
      ? await uploadToCloudinary(
          `data:image/jpeg;base64,${carBase64}`
        )
      : ''

    console.log('Saving Firestore document')

    await setDoc(doc(db, 'drivers', user.uid), {
      uid: user.uid,
      fullName,
      gender,
      driverCategory,
      companyName:
        driverCategory === 'company' ? companyName : '',
      profilePhoto: profileUrl,

      vehicle: {
        type: vehicleType,
        seats: Number(seats),
        color: carColor,
        plateImage: plateUrl,
        licenseImage: licenseUrl,
        carImage: carUrl,
      },

      verified: true,
      createdAt: serverTimestamp(),
    })

    console.log('NAVIGATING TO DRIVER HOME')

    Alert.alert('Success', 'Driver registered')

    // ✅ CORRECT EXPO ROUTER PATH
    router.replace('/(tabs)/driver-home')



  } catch (err: any) {
    console.error('SUBMIT ERROR:', err)
    Alert.alert('Registration failed', err.message ?? 'Unknown error')
  } finally {
    setSubmitting(false)
  }
}


  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Driver Registration</Text>
        <Text style={styles.headerStep}>Step {step} of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <>
            <TouchableOpacity
              onPress={() =>
                pickImage(setProfilePreview, setProfileBase64)
              }
            >
              <View style={styles.photoBox}>
                {profilePreview ? (
                  <Image
                    source={{ uri: profilePreview }}
                    style={styles.photo}
                  />
                ) : (
                  <Text>Add profile photo</Text>
                )}
              </View>
            </TouchableOpacity>

            <TextInput
              placeholder="Full name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />

            <View style={styles.row}>
              {['Male', 'Female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.option,
                    gender === g && styles.optionActive,
                  ]}
                  onPress={() => setGender(g as any)}
                >
                  <Text>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              {['personal', 'company', 'business'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.option,
                    driverCategory === c && styles.optionActive,
                  ]}
                  onPress={() => setDriverCategory(c as any)}
                >
                  <Text>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {driverCategory === 'company' && (
              <TextInput
                placeholder="Company name"
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
              />
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(2)}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <>
            <View style={styles.row}>
              {['Car', 'Minibus', 'Bus'].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.option,
                    vehicleType === v && styles.optionActive,
                  ]}
                  onPress={() => setVehicleType(v as any)}
                >
                  <Text>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Number of seats"
              keyboardType="numeric"
              style={styles.input}
              value={seats}
              onChangeText={setSeats}
            />

            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() =>
                pickImage(setPlatePreview, setPlateBase64)
              }
            >
              {platePreview ? (
                <Image
                  source={{ uri: platePreview }}
                  style={styles.uploadImage}
                />
              ) : (
                <Text>Upload plate</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() =>
                pickImage(setLicensePreview, setLicenseBase64)
              }
            >
              {licensePreview ? (
                <Image
                  source={{ uri: licensePreview }}
                  style={styles.uploadImage}
                />
              ) : (
                <Text>Upload licence</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(3)}
            >
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() =>
                pickImage(setCarPreview, setCarBase64)
              }
            >
              {carPreview ? (
                <Image
                  source={{ uri: carPreview }}
                  style={styles.uploadImage}
                />
              ) : (
                <Text>Upload car photo</Text>
              )}
            </TouchableOpacity>

            <TextInput
              placeholder="Car color"
              style={styles.input}
              value={carColor}
              onChangeText={setCarColor}
            />

            <TouchableOpacity
              style={[styles.button, submitting && { opacity: 0.6 }]}
              onPress={submitDriver}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>
                {submitting ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF4D3' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: '#C5E1A5' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  headerStep: { color: '#607D8B' },
  content: { padding: 20 },

  input: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },

  option: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },

  optionActive: { backgroundColor: '#C5E1A5' },

  photoBox: {
    height: 120,
    width: 120,
    backgroundColor: '#FFF',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    marginBottom: 20,
  },

  photo: { width: '100%', height: '100%', borderRadius: 60 },

  uploadBox: {
    height: 120,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 12,
  },

  uploadImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  button: {
    backgroundColor: '#8BC34A',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: { color: '#FFF', fontWeight: '600' },
})
