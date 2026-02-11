import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../src/firebase'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const register = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Missing information', 'Please fill all fields')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match')
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      const user = userCredential.user

      await setDoc(doc(db, 'users', user.uid), {
        fullName: name,
        email: email,
        role: 'passenger',
        createdAt: new Date(),
      })

      router.replace('/(tabs)/passenger')
    } catch (error: any) {
      Alert.alert('Registration failed', error.message)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Join Tiyeni today</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Full name"
          placeholderTextColor="#607D8B"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Email or phone number"
          placeholderTextColor="#607D8B"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#607D8B"
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eye}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#607D8B"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor="#607D8B"
          secureTextEntry={!showPassword}
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}> Log in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}


/* ✅ STYLES MUST EXIST — THIS FIXES THE ERROR */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4D3',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#263238',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#607D8B',
    textAlign: 'center',
    marginBottom: 32,
  },

  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C5E1A5',
    position: 'relative',
  },

  input: {
    fontSize: 15,
    color: '#263238',
  },

  eye: {
    position: 'absolute',
    right: 14,
    top: 14,
  },

  button: {
    backgroundColor: '#8BC34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  footerText: {
    fontSize: 14,
    color: '#607D8B',
  },

  link: {
    color: '#689F38',
    fontWeight: '500',
  },
})
