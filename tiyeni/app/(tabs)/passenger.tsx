import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore'
import { db } from "@/src/firebase"
import { Trip } from '../../types/trip'

/* ================= ROUTES ================= */

type Route = {
  id: string
  name: string
  from: string
  to: string
  pickupPoints: string[]
}

const ROUTES: Route[] = [
  {
    id: 'bt-ll-zalewa',
    name: 'Blantyre → Lilongwe (via Zalewa)',
    from: 'Blantyre',
    to: 'Lilongwe',
    pickupPoints: [
      'Blantyre','Kameza','Lunzu','Lilangwe','Zalewa',
      'Chingeni','Chikondi','Ntcheu','Dedza','Lilongwe',
    ],
  },
  {
    id: 'll-bt-zalewa',
    name: 'Lilongwe → Blantyre (via Zalewa)',
    from: 'Lilongwe',
    to: 'Blantyre',
    pickupPoints: [
      'Lilongwe','Dedza','Ntcheu','Chikondi','Chingeni',
      'Zalewa','Lilangwe','Lunzu','Kameza','Blantyre',
    ],
  },
  {
    id: 'bt-ll-mango',
    name: 'Blantyre → Lilongwe (via Mangochi)',
    from: 'Blantyre',
    to: 'Lilongwe',
    pickupPoints: [
      'Blantyre','Njuli','Thondwe','Zomba',
      'Liwonde','Mangochi Turnoff','Lilongwe',
    ],
  },
  {
    id: 'll-bt-mango',
    name: 'Lilongwe → Blantyre (via Mangochi)',
    from: 'Lilongwe',
    to: 'Blantyre',
    pickupPoints: [
      'Lilongwe','Mangochi Turnoff','Liwonde',
      'Zomba','Thondwe','Njuli','Blantyre',
    ],
  },
  {
    id: 'zm-bt',
    name: 'Zomba → Blantyre',
    from: 'Zomba',
    to: 'Blantyre',
    pickupPoints: ['Zomba', 'Njuli', 'Blantyre'],
  },
  {
    id: 'bt-zm',
    name: 'Blantyre → Zomba',
    from: 'Blantyre',
    to: 'Zomba',
    pickupPoints: ['Blantyre', 'Njuli', 'Zomba'],
  },
]

/* ================= COMPONENT ================= */

export default function PassengerHome() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [pickupPoint, setPickupPoint] = useState<string | null>(null)
  const [modalType, setModalType] =
    useState<'route' | 'pickup' | null>(null)

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)

  /* ================= REAL-TIME TRIP QUERY ================= */

  useEffect(() => {
    if (!selectedRoute) {
      setTrips([])
      return
    }

    setLoading(true)

    const q = query(
      collection(db, 'trips'),
      where('routeId', '==', selectedRoute.id),
      where('status', 'in', ['NOT_STARTED', 'ON_ROUTE'])
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const list: Trip[] = []

        snapshot.forEach((doc) => {
          const data = doc.data() as Trip

          // Filter seats > 0 (client side)
          if (data.availableSeats > 0) {
            list.push({
              id: doc.id,
              ...data,
            })
          }
        })

        setTrips(list)
        setLoading(false)
      },
      (error) => {
        console.log('Trip listener error:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [selectedRoute])

  /* ================= RENDER ================= */

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Your Journey</Text>

        {/* ROUTE SELECTOR */}
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalType('route')}
        >
          <Text style={styles.selectorText}>
            {selectedRoute ? selectedRoute.name : 'Select route'}
          </Text>
        </TouchableOpacity>

        {/* PICKUP SELECTOR */}
        <TouchableOpacity
          style={styles.selector}
          disabled={!selectedRoute}
          onPress={() => setModalType('pickup')}
        >
          <Text style={styles.selectorText}>
            {pickupPoint || 'Select pickup point'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
          Available Trips
        </Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#689F38"
            style={{ marginTop: 20 }}
          />
        )}

        <FlatList
          data={selectedRoute && pickupPoint ? trips : []}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>
                {selectedRoute && pickupPoint
                  ? 'No trips available'
                  : 'Select route and pickup point'}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.vehicleType}>
                {item.vehicleType} • {item.vehicleColor}
              </Text>

              <Text style={styles.status}>
                Status:{' '}
                {item.status === 'ON_ROUTE'
                  ? 'On the way'
                  : 'Not started'}
              </Text>

              <Text style={styles.seats}>
                Seats available: {item.availableSeats}
              </Text>

              <Text style={styles.price}>
                MWK {item.pricePerSeat}
              </Text>

              <TouchableOpacity style={styles.interestBtn}>
                <Text style={styles.interestText}>
                  I’m interested
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* MODAL */}
        <Modal
          visible={modalType !== null}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              {(modalType === 'route'
                ? ROUTES
                : selectedRoute?.pickupPoints || []
              ).map((item: any) => (
                <TouchableOpacity
                  key={
                    typeof item === 'string'
                      ? item
                      : item.id
                  }
                  style={styles.modalItem}
                  onPress={() => {
                    if (modalType === 'route') {
                      setSelectedRoute(item)
                      setPickupPoint(null)
                    } else {
                      setPickupPoint(item)
                    }
                    setModalType(null)
                  }}
                >
                  <Text style={styles.modalText}>
                    {typeof item === 'string'
                      ? item
                      : item.name}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => setModalType(null)}
              >
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  )
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF4D3' },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#263238',
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C5E1A5',
  },
  selectorText: { color: '#263238', fontSize: 15 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C5E1A5',
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#689F38',
    marginBottom: 4,
  },
  status: { fontSize: 13, color: '#607D8B' },
  seats: { fontSize: 13, marginBottom: 6, color: '#263238' },
  price: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  interestBtn: {
    backgroundColor: '#8BC34A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  interestText: { color: '#FFFFFF', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#607D8B' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalText: { fontSize: 15, color: '#263238' },
  cancel: {
    marginTop: 15,
    textAlign: 'center',
    color: '#689F38',
    fontWeight: '600',
  },
})
