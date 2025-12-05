import { useState } from 'react'
import { StyleSheet, TextInput, Button, View, Alert, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, Link } from 'expo-router'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { useAppDispatch } from '@/store/hooks'
import { register } from '@/store/authSlice'

export default function RegisterScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password_confirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (password !== password_confirm) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const resultAction = await dispatch(register({ name, email, password, password_confirm }))
      setLoading(false)
      if (register.fulfilled.match(resultAction)) {
        Alert.alert('Registered', 'Account created')
        router.replace('/(tabs)')
      } else {
        Alert.alert('Registration failed', resultAction.payload as string || 'Registration failed')
      }
    } catch (e) {
      setLoading(false)
      Alert.alert('Error', 'An unexpected error occurred')
    }
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <Image source={require('@/assets/images/myGuide-logo.png')} style={styles.logo} />
      <ThemedText type="title">Create Account</ThemedText>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Full name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry value={password_confirm} onChangeText={setPasswordConfirm} />
        <Button title={loading ? 'Creating...' : 'Register'} onPress={onSubmit} disabled={loading} />
      </View>
      <Link href="/login">
        <ThemedText type="link">Sign in</ThemedText>
      </Link>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 96, height: 96 },
  form: { gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
})
