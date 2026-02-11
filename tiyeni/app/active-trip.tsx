import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native"
import { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  doc,
  onSnapshot,
  updateDoc,
  collection,
} from "firebase/firestore"
import { auth, db } from "@/src/firebase"

export default function ActiveTrip() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const user = auth.currentUser

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [passengers, setPassengers] = useState<any[]>([])

  // ================= REAL-TIME TRIP LISTENER =================
  useEffect(() => {
    if (!id) return

    const tripRef = doc(db, "trips", String(id))

    const unsubscribe = onSnapshot(tripRef, snapshot => {
      if (!snapshot.exists()) {
        setTrip(null)
        setLoading(false)
        return
      }

      const data = snapshot.data()

      // 🔒 Ensure only driver sees this screen
      if (data.driverId !== user?.uid) {
        Alert.alert("Unauthorized")
        router.replace("/(tabs)/driver-home")
        return
      }

      setTrip({ id: snapshot.id, ...data })
      setLoading(false)
    })

    return () => unsubscribe()
  }, [id, user])

  // ================= REAL-TIME BOOKINGS LISTENER =================
  useEffect(() => {
    if (!id) return

    const bookingsRef = collection(
      db,
      "trips",
      String(id),
      "bookings"
    )

    const unsubscribe = onSnapshot(bookingsRef, snapshot => {
      const list: any[] = []
      snapshot.forEach(doc =>
        list.push({ id: doc.id, ...doc.data() })
      )
      setPassengers(list)
    })

    return () => unsubscribe()
  }, [id])

  // ================= ACTION HANDLERS =================

  const updateStatus = async (status: string) => {
    try {
      setActionLoading(true)
      await updateDoc(doc(db, "trips", String(id)), {
        status,
      })
    } catch (err) {
      console.log(err)
      Alert.alert("Error updating trip")
    } finally {
      setActionLoading(false)
    }
  }

  const completeTrip = async () => {
    await updateStatus("COMPLETED")
    Alert.alert("Trip completed")
    router.replace("/(tabs)/driver-home")
  }

  const cancelTrip = async () => {
    await updateStatus("CANCELLED")
    Alert.alert("Trip cancelled")
    router.replace("/(tabs)/driver-home")
  }

  // ================= LOADING =================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8BC34A" />
      </View>
    )
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text>No active trip found</Text>
      </View>
    )
  }

  const departure =
    trip.departureTime?.seconds
      ? new Date(trip.departureTime.seconds * 1000)
      : null

  return (
    <View style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Active Trip</Text>

      {/* TRIP INFO */}
      <View style={styles.card}>
        <Text style={styles.route}>
          {trip.routeFrom} → {trip.routeTo}
        </Text>

        <Text>Status: {trip.status}</Text>
        <Text>Waiting Place: {trip.waitingPlace}</Text>
        <Text>
          Departure:{" "}
          {departure ? departure.toLocaleString() : "N/A"}
        </Text>
        <Text>Price: MWK {trip.pricePerSeat}</Text>
        <Text>
          Seats: {trip.availableSeats} / {trip.totalSeats}
        </Text>
      </View>

      {/* PASSENGERS */}
      <Text style={styles.section}>Passengers</Text>

      <FlatList
        data={passengers}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={{ marginTop: 10 }}>
            No passengers yet
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.passengerCard}>
            <Text style={{ fontWeight: "600" }}>
              {item.passengerName}
            </Text>
            <Text>Seats: {item.seatsBooked}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />

      {/* ACTION BUTTONS */}
      {trip.status === "NOT_STARTED" && (
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => updateStatus("ON_ROUTE")}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Start Trip</Text>
          )}
        </TouchableOpacity>
      )}

      {trip.status === "ON_ROUTE" && (
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={completeTrip}
          disabled={actionLoading}
        >
          {actionLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Complete Trip</Text>
          )}
        </TouchableOpacity>
      )}

      {trip.status !== "COMPLETED" && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={cancelTrip}
          disabled={actionLoading}
        >
          <Text style={styles.btnText}>Cancel Trip</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF4D3",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#C5E1A5",
    marginBottom: 20,
  },
  route: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  passengerCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#C5E1A5",
  },
  startBtn: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  completeBtn: {
    backgroundColor: "#1D4ED8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: "#F44336",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
})
