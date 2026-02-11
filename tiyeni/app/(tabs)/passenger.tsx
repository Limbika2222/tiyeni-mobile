import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native'
import { useState } from 'react'

type Route = {
  id: string
  name: string
  from: string
  to: string
  pickupPoints: string[]
}

type Vehicle = {
  id: string
  type: 'Bus' | 'Minibus' | 'Car'
  routeId: string
  status: 'Not started' | 'On the way'
  milestone?: string
  seats: number
}

/**
 * ✅ NORMALIZED ROUTES (FORWARD + REVERSE)
 * ORDER OF pickupPoints IS CRITICAL
 */
const ROUTES: Route[] = [
  // -----------------------------
  // Blantyre ↔ Lilongwe (via Zalewa)
  // -----------------------------
  {
    id: 'bt-ll-zalewa',
    name: 'Blantyre → Lilongwe (via Zalewa)',
    from: 'Blantyre',
    to: 'Lilongwe',
    pickupPoints: [
      'Blantyre',
      'Kameza',
      'Lunzu',
      'Lilangwe',
      'Zalewa',
      'Chingeni',
      'Chikondi',
      'Ntcheu',
      'Dedza',
      'Lilongwe',
    ],
  },
  {
    id: 'll-bt-zalewa',
    name: 'Lilongwe → Blantyre (via Zalewa)',
    from: 'Lilongwe',
    to: 'Blantyre',
    pickupPoints: [
      'Lilongwe',
      'Dedza',
      'Ntcheu',
      'Chikondi',
      'Chingeni',
      'Zalewa',
      'Lilangwe',
      'Lunzu',
      'Kameza',
      'Blantyre',
    ],
  },

  // -----------------------------
  // Blantyre ↔ Lilongwe (via Mangochi)
  // -----------------------------
  {
    id: 'bt-ll-mango',
    name: 'Blantyre → Lilongwe (via Mangochi)',
    from: 'Blantyre',
    to: 'Lilongwe',
    pickupPoints: [
      'Blantyre',
      'Njuli',
      'Thondwe',
      'Zomba',
      'Liwonde',
      'Mangochi Turnoff',
      'Lilongwe',
    ],
  },
  {
    id: 'll-bt-mango',
    name: 'Lilongwe → Blantyre (via Mangochi)',
    from: 'Lilongwe',
    to: 'Blantyre',
    pickupPoints: [
      'Lilongwe',
      'Mangochi Turnoff',
      'Liwonde',
      'Zomba',
      'Thondwe',
      'Njuli',
      'Blantyre',
    ],
  },

  // -----------------------------
  // Zomba ↔ Blantyre
  // -----------------------------
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

export default function PassengerHome() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [pickupPoint, setPickupPoint] = useState<string | null>(null)
  const [modalType, setModalType] = useState<'route' | 'pickup' | null>(null)

  // 🔹 Mock vehicles (must reference routeId)
  const vehicles: Vehicle[] = [
    {
      id: '1',
      type: 'Minibus',
      routeId: 'zm-bt',
      status: 'On the way',
      milestone: 'Njuli',
      seats: 3,
    },
    {
      id: '2',
      type: 'Car',
      routeId: 'bt-ll-zalewa',
      status: 'Not started',
      seats: 2,
    },
    {
      id: '3',
      type: 'Bus',
      routeId: 'll-bt-zalewa',
      status: 'On the way',
      milestone: 'Dedza',
      seats: 18,
    },
  ]

  const filteredVehicles =
    selectedRoute && pickupPoint
      ? vehicles.filter((v) => v.routeId === selectedRoute.id)
      : []

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your journey</Text>

      {/* ROUTE SELECTOR */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalType('route')}
      >
        <Text style={styles.selectorText}>
          {selectedRoute ? selectedRoute.name : 'Select route'}
        </Text>
      </TouchableOpacity>

      {/* PICKUP POINT SELECTOR */}
      <TouchableOpacity
        style={styles.selector}
        disabled={!selectedRoute}
        onPress={() => setModalType('pickup')}
      >
        <Text style={styles.selectorText}>
          {pickupPoint || 'Select pickup point'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Available vehicles</Text>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {selectedRoute && pickupPoint
              ? 'No vehicles available'
              : 'Select route and pickup point'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.vehicleType}>{item.type}</Text>

            <Text style={styles.status}>
              Status:{' '}
              {item.status === 'On the way'
                ? `On the way (${item.milestone})`
                : 'Not started'}
            </Text>

            <Text style={styles.seats}>
              Seats available: {item.seats}
            </Text>

            <TouchableOpacity style={styles.interestBtn}>
              <Text style={styles.interestText}>I’m interested</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* MODALS */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            {(modalType === 'route'
              ? ROUTES
              : selectedRoute?.pickupPoints || []
            ).map((item: any) => (
              <TouchableOpacity
                key={typeof item === 'string' ? item : item.id}
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
                  {typeof item === 'string' ? item : item.name}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={() => setModalType(null)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4D3',
    padding: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#263238',
  },

  selector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C5E1A5',
  },

  selectorText: {
    color: '#263238',
    fontSize: 15,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C5E1A5',
  },

  vehicleType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#689F38',
  },

  status: {
    fontSize: 13,
    color: '#607D8B',
  },

  seats: {
    fontSize: 13,
    marginBottom: 10,
    color: '#263238',
  },

  interestBtn: {
    backgroundColor: '#8BC34A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  interestText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#607D8B',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    borderRadius: 12,
    padding: 16,
  },

  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  modalText: {
    fontSize: 15,
    color: '#263238',
  },

  cancel: {
    marginTop: 12,
    textAlign: 'center',
    color: '#689F38',
    fontWeight: '600',
  },
})
