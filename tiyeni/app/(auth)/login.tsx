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
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../src/firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Missing information', 'Please enter email and password')
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.replace('/(tabs)/passenger')
    } catch (error: any) {
      Alert.alert('Login failed', error.message)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* LOGO */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
      />

      {/* TITLE */}
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      {/* EMAIL */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Email or phone number"
          placeholderTextColor="#607D8B"
          style={styles.input}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* PASSWORD */}
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

      {/* LOGIN BUTTON */}
      <TouchableOpacity style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      {/* SIGN UP */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}> Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

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
