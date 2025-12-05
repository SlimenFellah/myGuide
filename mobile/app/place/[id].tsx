import { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ThemedView } from '@/components/themed-view'
import { ThemedText } from '@/components/themed-text'
import tourismService from '@/services/tourismService'

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [place, setPlace] = useState<any | null>(null)

  useEffect(() => {
    ;(async () => {
      if (!id) return
      const r = await tourismService.getPlace(Number(id))
      if (r.success) setPlace(r.data)
    })()
  }, [id])

  if (!place) return <ThemedView style={styles.container} />

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title">{place.name}</ThemedText>
        <ThemedText>{place.municipality?.name}, {place.province?.name || place.province_name}</ThemedText>
        {Array.isArray(place.images) && place.images.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
            {place.images.map((img: any) => (
              <Image key={img.id} source={{ uri: img.image }} style={styles.photo} />
            ))}
          </ScrollView>
        ) : null}
        <ThemedText>{place.description}</ThemedText>
        <View style={styles.meta}>
          <ThemedText>Rating: {String(place.average_rating ?? 0)}</ThemedText>
          <ThemedText>Reviews: {String(place.total_feedbacks ?? 0)}</ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  photo: { width: 240, height: 160, marginRight: 12, borderRadius: 8 },
  meta: { flexDirection: 'row', gap: 16 },
})
