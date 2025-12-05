import { StyleSheet, View, Button, Alert, TextInput, FlatList } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout, checkAuth } from '@/store/authSlice'
import subscriptionService from '@/services/subscriptionService'
import { authService } from '@/services/authService'
import { useEffect, useState } from 'react'
import { useRouter } from 'expo-router'

export default function ProfileScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const [subscription, setSubscription] = useState<any | null>(null)
  const [view, setView] = useState<'main' | 'settings' | 'subscription'>('main')
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({
    first_name: user?.full_name?.split(' ')[0] || '',
    last_name: user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
  })
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', new_password_confirm: '' })

  useEffect(() => {
    ; (async () => {
      try {
        const s = await subscriptionService.getUserSubscription()
        setSubscription(s)
      } catch { }
    })()
  }, [])

  const handleLogout = async () => {
    await dispatch(logout())
    router.replace('/login')
  }

  const loadPlans = async () => {
    setLoading(true)
    try {
      const p = await subscriptionService.getSubscriptionPlans()
      setPlans(p || [])
    } catch {
      Alert.alert('Error', 'Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setLoading(true)
    try {
      const res = await authService.updateProfile(profileForm)
      if (res.success) {
        await dispatch(checkAuth())
        Alert.alert('Success', 'Profile updated')
        setView('main')
      } else {
        Alert.alert('Error', res.error || 'Update failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (!passwordForm.new_password || passwordForm.new_password !== passwordForm.new_password_confirm) {
      Alert.alert('Error', 'New passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await authService.changePassword(passwordForm.old_password, passwordForm.new_password)
      if (res.success) {
        Alert.alert('Success', 'Password changed')
        setPasswordForm({ old_password: '', new_password: '', new_password_confirm: '' })
      } else {
        Alert.alert('Error', res.error || 'Password change failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (view === 'settings') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Settings</ThemedText>
        <View style={styles.card}>
          <ThemedText type="subtitle">Profile</ThemedText>
          <TextInput style={styles.input} placeholder="First name" value={profileForm.first_name} onChangeText={t => setProfileForm({ ...profileForm, first_name: t })} />
          <TextInput style={styles.input} placeholder="Last name" value={profileForm.last_name} onChangeText={t => setProfileForm({ ...profileForm, last_name: t })} />
          <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={profileForm.email} onChangeText={t => setProfileForm({ ...profileForm, email: t })} />
          <Button title={loading ? 'Saving...' : 'Save'} onPress={saveProfile} disabled={loading} />
        </View>
        <View style={styles.card}>
          <ThemedText type="subtitle">Change Password</ThemedText>
          <TextInput style={styles.input} placeholder="Old password" secureTextEntry value={passwordForm.old_password} onChangeText={t => setPasswordForm({ ...passwordForm, old_password: t })} />
          <TextInput style={styles.input} placeholder="New password" secureTextEntry value={passwordForm.new_password} onChangeText={t => setPasswordForm({ ...passwordForm, new_password: t })} />
          <TextInput style={styles.input} placeholder="Confirm new password" secureTextEntry value={passwordForm.new_password_confirm} onChangeText={t => setPasswordForm({ ...passwordForm, new_password_confirm: t })} />
          <Button title={loading ? 'Updating...' : 'Update Password'} onPress={changePassword} disabled={loading} />
        </View>
        <View style={styles.actions}>
          <Button title="Back" onPress={() => setView('main')} />
        </View>
      </ThemedView>
    )
  }

  if (view === 'subscription') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Subscription</ThemedText>
        <View style={styles.card}>
          {subscription ? (
            <ThemedText>Current: {subscription?.plan?.name || subscription.status}</ThemedText>
          ) : (
            <ThemedText>No active subscription</ThemedText>
          )}
        </View>
        <View style={styles.actions}>
          <Button title={loading ? 'Loading...' : 'Load Plans'} onPress={loadPlans} disabled={loading} />
        </View>
        <FlatList
          data={plans}
          keyExtractor={(item) => String(item.id || item.name)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              {item.price ? <ThemedText>{item.price} {item.currency || 'USD'}</ThemedText> : null}
              <Button title="Select" onPress={() => Alert.alert('Subscription', 'Plan selection coming soon')} />
            </View>
          )}
          ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 24 }}>No plans available</ThemedText>}
        />
        <View style={styles.actions}>
          <Button title="Back" onPress={() => setView('main')} />
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <View style={styles.card}>
        <ThemedText type="defaultSemiBold">{user?.full_name}</ThemedText>
        <ThemedText>{user?.email}</ThemedText>
        {subscription ? (
          <ThemedText>Subscription: {subscription?.plan?.name || subscription.status}</ThemedText>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Button title="Settings" onPress={() => setView('settings')} />
        <Button title="Manage Subscription" onPress={() => setView('subscription')} />
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12 },
  actions: { gap: 12, marginTop: 24 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginTop: 8 },
})
