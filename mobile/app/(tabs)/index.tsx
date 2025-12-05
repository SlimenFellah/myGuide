import { useEffect, useState } from 'react'
import { FlatList, Image, StyleSheet, View, TouchableOpacity } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import tourismService from '@/services/tourismService'
import { useAppSelector } from '@/store/hooks'

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAppSelector(state => state.auth)
  const [featured, setFeatured] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ; (async () => {
      const r = await tourismService.getPopularPlaces()
      if (r.success) {
        setFeatured(r.data)
        setError(null)
      } else {
        setError(r.error || 'Failed to load featured places')
      }
    })()
  }, [])

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Hello {user?.full_name || ''}</ThemedText>
      <ThemedText type="subtitle">Featured Places</ThemedText>
      <FlatList
        data={featured}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/place/${item.id}`)} style={styles.card}>
            {item.main_image ? (
              <Image source={{ uri: item.main_image }} style={styles.image} />
            ) : null}
            <View style={styles.info}>
              <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
              <ThemedText>{item.province}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 24 }}>{error ? error : 'No featured places'}</ThemedText>}
      />
      <Link href="/(tabs)/explore">
        <ThemedText type="link">Explore more</ThemedText>
      </Link>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  image: { width: '100%', height: 160 },
  info: { padding: 12 },
})
