import { View, Text, Button } from 'react-native'
import { auth } from '../../src/firebase'

export default function Profile() {
  return (
    <View>
      <Text>Profile</Text>
      <Button title="Logout" onPress={() => auth.signOut()} />
    </View>
  )
}
