import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View, Button, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { generateTripPlan, getTripPlans, updateFormData, resetFormData } from '@/store/tripPlannerSlice'
import { useRouter } from 'expo-router'

const STEPS = ['Province', 'Type', 'Details', 'Preferences']

export default function TripScreen() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { plans, currentPlan, isLoading, formData } = useAppSelector(state => state.tripPlanner)
  const [step, setStep] = useState(0)
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list')

  useEffect(() => {
    dispatch(getTripPlans())
  }, [dispatch])

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1)
    else handleGenerate()
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
    else setViewMode('list')
  }

  const handleGenerate = async () => {
    const tripData = {
      destination: formData.province,
      trip_type: formData.tripType,
      start_date: formData.startDate,
      end_date: formData.endDate,
      budget: parseFloat(formData.budget),
      budget_currency: 'USD',
      group_size: formData.groupSize,
      interests: Object.keys(formData.preferences).filter(key => formData.preferences[key]),
      accommodation_preference: 'mid-range',
      activity_level: 'moderate',
      special_requirements: [formData.allergies, formData.additionalNotes].filter(Boolean).join('. ')
    }

    const resultAction = await dispatch(generateTripPlan(tripData))
    if (generateTripPlan.fulfilled.match(resultAction)) {
      Alert.alert('Success', 'Trip plan generated!')
      setViewMode('list')
      setStep(0)
      dispatch(resetFormData())
    } else {
      Alert.alert('Error', resultAction.payload as string || 'Failed to generate plan')
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <ThemedText type="subtitle">Where to?</ThemedText>
            {['Algiers', 'Oran', 'Constantine', 'Annaba', 'Batna', 'Tlemcen', 'Sétif', 'Béjaïa'].map(p => (
              <TouchableOpacity key={p} onPress={() => dispatch(updateFormData({ province: p }))} style={[styles.option, formData.province === p && styles.selectedOption]}>
                <ThemedText style={formData.province === p ? styles.selectedText : undefined}>{p}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )
      case 1:
        return (
          <View style={styles.stepContainer}>
            <ThemedText type="subtitle">Trip Type</ThemedText>
            {['cultural', 'adventure', 'relaxation', 'family', 'historical', 'culinary'].map(t => (
              <TouchableOpacity key={t} onPress={() => dispatch(updateFormData({ tripType: t }))} style={[styles.option, formData.tripType === t && styles.selectedOption]}>
                <ThemedText style={formData.tripType === t ? styles.selectedText : undefined}>{t.charAt(0).toUpperCase() + t.slice(1)}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )
      case 2:
        return (
          <View style={styles.stepContainer}>
            <ThemedText type="subtitle">Details</ThemedText>
            <TextInput style={styles.input} placeholder="Start Date (YYYY-MM-DD)" value={formData.startDate} onChangeText={t => dispatch(updateFormData({ startDate: t }))} />
            <TextInput style={styles.input} placeholder="End Date (YYYY-MM-DD)" value={formData.endDate} onChangeText={t => dispatch(updateFormData({ endDate: t }))} />
            <TextInput style={styles.input} placeholder="Budget (USD)" keyboardType="numeric" value={formData.budget} onChangeText={t => dispatch(updateFormData({ budget: t }))} />
            <TextInput style={styles.input} placeholder="Group Size" keyboardType="numeric" value={String(formData.groupSize)} onChangeText={t => dispatch(updateFormData({ groupSize: parseInt(t) || 1 }))} />
          </View>
        )
      case 3:
        return (
          <View style={styles.stepContainer}>
            <ThemedText type="subtitle">Preferences</ThemedText>
            {Object.keys(formData.preferences).map(p => (
              <TouchableOpacity key={p} onPress={() => dispatch(updateFormData({ preferences: { [p]: !formData.preferences[p] } }))} style={[styles.option, formData.preferences[p] && styles.selectedOption]}>
                <ThemedText style={formData.preferences[p] ? styles.selectedText : undefined}>{p.replace(/([A-Z])/g, ' $1').trim()}</ThemedText>
              </TouchableOpacity>
            ))}
            <TextInput style={styles.input} placeholder="Allergies" value={formData.allergies} onChangeText={t => dispatch(updateFormData({ allergies: t }))} />
            <TextInput style={styles.input} placeholder="Notes" value={formData.additionalNotes} onChangeText={t => dispatch(updateFormData({ additionalNotes: t }))} />
          </View>
        )
    }
  }

  if (viewMode === 'create') {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">New Trip: {STEPS[step]}</ThemedText>
          {renderStep()}
          <View style={styles.buttons}>
            <Button title="Back" onPress={handleBack} />
            <Button title={step === STEPS.length - 1 ? (isLoading ? 'Generating...' : 'Generate') : 'Next'} onPress={handleNext} disabled={isLoading} />
          </View>
        </ScrollView>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Trips</ThemedText>
        <Button title="New Trip" onPress={() => setViewMode('create')} />
      </View>
      <FlatList
        data={plans}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <ThemedText type="defaultSemiBold">{item.title || `Trip to ${item.province}`}</ThemedText>
            <ThemedText>{item.duration} days • ${item.total_cost}</ThemedText>
            <ThemedText numberOfLines={2}>{item.summary}</ThemedText>
          </View>
        )}
        contentContainerStyle={{ gap: 12 }}
        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 24 }}>No trips yet. Create one!</ThemedText>}
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  scroll: { gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, gap: 4 },
  stepContainer: { gap: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  option: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  selectedOption: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  selectedText: { color: 'white' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
})
