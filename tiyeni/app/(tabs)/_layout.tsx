import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true, // ✅ VERY IMPORTANT – resets screen state when switching tabs
      }}
    >
      {/* ================= MAIN TABS ================= */}
      <Tabs.Screen
        name="passenger"
        options={{
          title: 'Passenger',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="driver"
        options={{
          title: 'Driver',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* ================= HIDDEN ROUTES ================= */}
      {/* These are NOT tabs, but part of the same stack */}
      <Tabs.Screen
        name="driver-home"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="register-driver"
        options={{
          href: null,
        }}
      />
    </Tabs>
  )
}
