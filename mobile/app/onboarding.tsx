import { useRef, useState } from 'react'
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Link, useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width } = Dimensions.get('window')

const slides = [
  { key: '1', title: 'Welcome to MyGuide', text: 'Discover places, plan trips, and chat with your assistant.', image: require('@/assets/images/myGuide-logo.png') },
  { key: '2', title: 'Explore Places', text: 'Browse featured spots and save your favorites on the go.', image: require('@/assets/images/onboarding-1.jpg') },
  { key: '3', title: 'Plan Your Trip', text: 'Generate personalized trip plans tailored to your preferences.', image: require('@/assets/images/onboarding-2.jpg') },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const ref = useRef<FlatList>(null)

  const complete = async () => {
    await AsyncStorage.setItem('onboarded', 'true')
    router.replace('/register')
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={ref}
        data={slides}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={ev => {
          const i = Math.round(ev.nativeEvent.contentOffset.x / width)
          setIndex(i)
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.image} />
            <ThemedText type="title" style={styles.center}>{item.title}</ThemedText>
            <ThemedText style={styles.center}>{item.text}</ThemedText>
          </View>
        )}
      />
      <View style={styles.footer}>
        <Link href="/login">
          <ThemedText type="link">Sign in</ThemedText>
        </Link>
        <ThemedText onPress={complete} type="link">Get started</ThemedText>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  image: { width: 160, height: 160, marginBottom: 24 },
  center: { textAlign: 'center' },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between' },
})
