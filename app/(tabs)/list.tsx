import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getFamilyConfig } from '@/lib/storage';
import { useSharedList } from '@/lib/useSharedList';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListScreen() {
  const [cfg, setCfg] = useState<{ familyId: string; memberName: string } | null>(null);
  useEffect(() => { (async () => setCfg(await getFamilyConfig()))(); }, []);

  const { items, addItem, toggleItem, removeItem } = useSharedList(cfg?.familyId);
  const [text, setText] = useState('');

  const header = useMemo(() => (
    <View style={styles.header}>
      <ThemedText type="title">{cfg ? `Family ${cfg.familyId}` : 'Loading…'}</ThemedText>
      {cfg && <ThemedText style={{ opacity: 0.8 }}>Hi {cfg.memberName} 👋</ThemedText>}
    </View>
  ), [cfg]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {header}
          <View style={styles.row}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add milk, bread…"
              placeholderTextColor="#999"
              style={styles.input}
              onSubmitEditing={() => {
                if (!text.trim() || !cfg) return;
                addItem(text.trim(), cfg.memberName);
                setText('');
                Haptics.selectionAsync();
              }}
            />
            <Pressable
              onPress={() => {
                if (!text.trim() || !cfg) return;
                addItem(text.trim(), cfg.memberName);
                setText('');
                Haptics.selectionAsync();
              }}
              style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            >
              <ThemedText type="defaultSemiBold">Add</ThemedText>
            </Pressable>
          </View>
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 60 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Pressable onLongPress={() => removeItem(item.id)} onPress={() => toggleItem(item.id)} style={({ pressed }) => [styles.item, item.done && styles.done, pressed && styles.pressed]}>
                <ThemedText type="defaultSemiBold" style={[styles.itemText, item.done && styles.itemDoneText]}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.meta}>by {item.addedBy}</ThemedText>
              </Pressable>
            )}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: { gap: 4, paddingTop: 6, paddingBottom: 8 },
  row: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', padding: 14, borderRadius: 14 },
  addBtn: { paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#90CAF9', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85 },
  item: { padding: 16, borderRadius: 16, backgroundColor: '#FFF0B2' },
  done: { backgroundColor: '#E0E0E0' },
  itemText: { fontSize: 16 },
  itemDoneText: { textDecorationLine: 'line-through', opacity: 0.7 },
  meta: { opacity: 0.7, marginTop: 4, fontSize: 12 },
});
