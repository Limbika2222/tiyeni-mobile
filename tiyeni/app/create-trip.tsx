import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  View,
} from "react-native"
import { useEffect, useState } from "react"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Dropdown } from "react-native-element-dropdown"
import { auth, db } from "../src/firebase"
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore"
import { useRouter } from "expo-router"
import { ROUTES } from "../constants/routes"

export default function CreateTrip() {
  const router = useRouter()
  const user = auth.currentUser

  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)

  const [departureTime, setDepartureTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [waitingPlace, setWaitingPlace] = useState("")
  const [endingPlace, setEndingPlace] = useState("")
  const [price, setPrice] = useState("")
  const [seats, setSeats] = useState("")
  const [preferredGender, setPreferredGender] = useState("ANY")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  // ================= LOAD VEHICLES =================
  useEffect(() => {
    const loadVehicles = async () => {
      if (!user) return

      try {
        const snap = await getDocs(
          collection(db, "drivers", user.uid, "vehicles")
        )

        const list: any[] = []
        snap.forEach(d =>
          list.push({
            label: `${d.data().type} (${d.data().color})`,
            value: d.id,
            ...d.data(),
          })
        )

        setVehicles(list)
      } catch (err) {
        console.log(err)
      }
    }

    loadVehicles()
  }, [user])

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!selectedVehicle) return "Select vehicle"
    if (!selectedRoute) return "Select route"
    if (!waitingPlace.trim()) return "Enter waiting place"
    if (!price || Number(price) <= 0) return "Invalid price"
    if (!seats || Number(seats) <= 0) return "Invalid seats"
    if (
      selectedVehicle?.seats &&
      Number(seats) > selectedVehicle.seats
    )
      return "Seats exceed vehicle capacity"

    if (departureTime <= new Date())
      return "Departure must be in the future"

    return null
  }

  // ================= CREATE TRIP =================
  const createTrip = async () => {
    if (!user) {
      Alert.alert("Not authenticated")
      return
    }

    const error = validateForm()
    if (error) {
      Alert.alert(error)
      return
    }

    try {
      setLoading(true)

      // 🔎 Check existing active trip
      const activeQuery = query(
        collection(db, "trips"),
        where("driverId", "==", user.uid),
        where("status", "in", ["NOT_STARTED", "ON_ROUTE"])
      )

      const activeSnap = await getDocs(activeQuery)

      if (!activeSnap.empty) {
        const existingTrip = activeSnap.docs[0]

        router.replace({
          pathname: "/active-trip",
          params: { id: existingTrip.id },
        })

        return
      }

      // Fetch driver info
      const driverDoc = await getDoc(doc(db, "drivers", user.uid))
      const driverData = driverDoc.data()

      const docRef = await addDoc(collection(db, "trips"), {
        driverId: user.uid,
        driverName: driverData?.fullName || "",

        vehicleId: selectedVehicle.value,
        vehicleType: selectedVehicle.type,
        vehicleColor: selectedVehicle.color,
        vehicleImage: selectedVehicle.carImage,

        routeId: selectedRoute.id,
        routeName: selectedRoute.name,
        routeFrom: selectedRoute.from,
        routeTo: selectedRoute.to,

        departureTime,
        waitingPlace,
        endingPlace: endingPlace || null,

        pricePerSeat: Number(price),
        totalSeats: selectedVehicle.seats || 0,
        availableSeats: Number(seats),

        preferredGender,
        status: "NOT_STARTED",
        milestoneIndex: 0,
        notes: notes || null,

        createdAt: serverTimestamp(),
      })

      router.replace({
        pathname: "/active-trip",
        params: { id: docRef.id },
      })
    } catch (err) {
      console.log(err)
      Alert.alert("Error creating trip")
    } finally {
      setLoading(false)
    }
  }

  // ================= UI =================
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Trip</Text>

      <Dropdown
        style={styles.dropdown}
        data={vehicles}
        labelField="label"
        valueField="value"
        placeholder="Select Vehicle"
        value={selectedVehicle?.value}
        onChange={item => setSelectedVehicle(item)}
      />

      <Dropdown
        style={styles.dropdown}
        data={ROUTES}
        labelField="name"
        valueField="id"
        placeholder="Select Route"
        value={selectedRoute?.id}
        onChange={item => setSelectedRoute(item)}
      />

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: "#263238" }}>
          Departure: {departureTime.toLocaleString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={departureTime}
          mode="datetime"
          display="default"
          onChange={(e, date) => {
            setShowDatePicker(false)
            if (date) setDepartureTime(date)
          }}
        />
      )}

      <TextInput
        placeholder="Waiting place"
        placeholderTextColor="#9E9E9E"
        style={styles.input}
        value={waitingPlace}
        onChangeText={setWaitingPlace}
      />

      <TextInput
        placeholder="Ending place (optional)"
        placeholderTextColor="#9E9E9E"
        style={styles.input}
        value={endingPlace}
        onChangeText={setEndingPlace}
      />

      <TextInput
        placeholder="Price per seat"
        placeholderTextColor="#9E9E9E"
        keyboardType="numeric"
        style={styles.input}
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        placeholder="Seats available"
        placeholderTextColor="#9E9E9E"
        keyboardType="numeric"
        style={styles.input}
        value={seats}
        onChangeText={setSeats}
      />

      <Dropdown
        style={styles.dropdown}
        data={[
          { label: "Any", value: "ANY" },
          { label: "Male Only", value: "MALE" },
          { label: "Female Only", value: "FEMALE" },
        ]}
        labelField="label"
        valueField="value"
        placeholder="Preferred Gender"
        value={preferredGender}
        onChange={item => setPreferredGender(item.value)}
      />

      <TextInput
        placeholder="Notes (optional)"
        placeholderTextColor="#9E9E9E"
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.button} onPress={createTrip}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Trip</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4D3",
    padding: 20,
  },
  back: {
    color: "#689F38",
    fontWeight: "600",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#263238",
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#C5E1A5",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#C5E1A5",
    color: "#263238",
  },
  button: {
    backgroundColor: "#8BC34A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
})
