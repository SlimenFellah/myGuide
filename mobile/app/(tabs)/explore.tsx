import { useEffect, useState } from 'react'
import { FlatList, Image, StyleSheet, View, TouchableOpacity, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getPlaces } from '@/store/tourismSlice'

export default function ExploreScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { places, isLoading } = useAppSelector(state => state.tourism)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(getPlaces({}))
  }, [dispatch])

  const handleSearch = () => {
    dispatch(getPlaces(search ? { search } : {}))
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore</ThemedText>
      <TextInput style={styles.input} placeholder="Search places" value={search} onChangeText={setSearch} onSubmitEditing={handleSearch} />
      <FlatList
        data={places}
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
        refreshing={isLoading}
        onRefresh={handleSearch}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  image: { width: '100%', height: 160 },
  info: { padding: 12 },
})
