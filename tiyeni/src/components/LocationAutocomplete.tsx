import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useEffect, useState } from 'react'

type Location = {
  name: string
  lat: number
  lon: number
}

type Props = {
  placeholder: string
  onSelect: (location: Location) => void
}

const GEOAPIFY_API_KEY = '74a6fc81e0b14daaa7663402170a5110'

export default function LocationAutocomplete({ placeholder, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      return
    }

    const timeout = setTimeout(() => {
      searchLocation(query)
    }, 400) // debounce

    return () => clearTimeout(timeout)
  }, [query])

  const searchLocation = async (text: string) => {
    try {
      setLoading(true)
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&limit=5&apiKey=${GEOAPIFY_API_KEY}`
      )

      const data = await res.json()

      const locations = data.features.map((f: any) => ({
        name: f.properties.formatted,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
      }))

      setResults(locations)
    } catch (e) {
      console.log('Geoapify error', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <TextInput
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        placeholderTextColor="#607D8B"
      />

      {loading && <ActivityIndicator size="small" />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => {
              onSelect(item)
              setQuery(item.name)
              setResults([])
            }}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#C5E1A5',
    marginBottom: 8,
    fontSize: 15,
    color: '#263238',
  },

  item: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },

  itemText: {
    fontSize: 14,
    color: '#263238',
  },
})
