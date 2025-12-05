import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, TextInput, View, Button, Alert } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getOrCreateSession, getMessages, sendMessage } from '@/store/chatbotSlice'

export default function ChatbotScreen() {
  const dispatch = useAppDispatch()
  const { messages, session } = useAppSelector(state => state.chatbot)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
    dispatch(getOrCreateSession()).then((action) => {
      if (getOrCreateSession.fulfilled.match(action)) {
        dispatch(getMessages((action.payload as any).id))
      } else {
        setError((action.payload as string) || 'Failed to initialize chat')
      }
    })
  }, [dispatch])

  const send = async () => {
    if (!session || !text.trim()) return
    setSending(true)
    setError(null)
    const action = await dispatch(sendMessage({ text: text.trim(), sessionId: session.id }))
    setSending(false)
    if (sendMessage.fulfilled.match(action)) {
      setText('')
    } else {
      const msg = (action.payload as string) || 'Failed to send message'
      setError(msg)
      Alert.alert('Chatbot', msg)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Assistant</ThemedText>
      {error ? <ThemedText style={{ color: 'red' }}>{error}</ThemedText> : null}
      <FlatList
        data={messages}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ThemedText style={{ alignSelf: item.message_type === 'user' ? 'flex-end' : 'flex-start', marginVertical: 4, backgroundColor: item.message_type === 'user' ? '#e1f5fe' : '#f5f5f5', padding: 8, borderRadius: 8 }}>
            {item.content}
          </ThemedText>
        )}
        contentContainerStyle={{ gap: 8 }}
        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 24 }}>No messages yet</ThemedText>}
      />
      <View style={styles.row}>
        <TextInput style={styles.input} placeholder="Type a message" value={text} onChangeText={setText} />
        <Button title={sending ? 'Sending...' : 'Send'} onPress={send} disabled={sending} />
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
})
