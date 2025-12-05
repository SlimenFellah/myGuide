import { useState } from 'react'
import { StyleSheet, TextInput, Button, View, Alert, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, Link } from 'expo-router'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import { useAppDispatch } from '@/store/hooks'
import { login } from '@/store/authSlice'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setLoading(true)
    try {
      const resultAction = await dispatch(login({ email: email.trim(), password }))
      setLoading(false)
      if (login.fulfilled.match(resultAction)) {
        router.replace('/(tabs)')
      } else {
        Alert.alert('Login failed', resultAction.payload as string || 'Check your credentials')
      }
    } catch (e) {
      setLoading(false)
      Alert.alert('Error', 'An unexpected error occurred')
    }
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }] }>
      <Image source={require('@/assets/images/myGuide-logo.png')} style={styles.logo} />
      <ThemedText type="title">Sign In</ThemedText>
      <View style={styles.form}>
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title={loading ? 'Signing in...' : 'Sign In'} onPress={onSubmit} disabled={loading} />
      </View>
      <Link href="/register">
        <ThemedText type="link">Create account</ThemedText>
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
