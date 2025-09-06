import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { copyToClipboard, shareText } from '@/lib/invite';
import { getFamilyConfig, removeFamilyConfig } from '@/lib/storage';
import { useSharedList } from '@/lib/useSharedList';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListScreen() {
  const router = useRouter();
  const [cfg, setCfg] = useState<{ familyId: string; memberName: string } | null>(null);
  useEffect(() => { (async () => setCfg(await getFamilyConfig()))(); }, []);

  const { items, addItem, toggleItem, removeItem } = useSharedList(cfg?.familyId);
  const [text, setText] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const header = useMemo(() => (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText type="title">{cfg ? `Family ${cfg.familyId}` : 'Loading…'}</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {cfg && (
            <TouchableOpacity onPress={() => setInviteOpen(true)} style={styles.inviteBtn}>
              <ThemedText style={styles.inviteText}>Invite</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={async () => {
            await removeFamilyConfig();
            router.replace('/onboarding');
          }} style={styles.signOutBtn}>
            <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
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
          {/* Invite Modal */}
          <Modal visible={inviteOpen} animationType="slide" transparent onRequestClose={() => setInviteOpen(false)}>
            <View style={styles.modalBg}>
              <View style={styles.modalCard}>
                <ThemedText type="title">Invite to Family</ThemedText>
                <ThemedText style={styles.codeLabel}>Family Code:</ThemedText>
                <ThemedText selectable style={styles.code}>{cfg?.familyId}</ThemedText>
                <View style={styles.inviteRow}>
                  <TouchableOpacity style={styles.inviteAction} onPress={async () => { if (cfg) { await copyToClipboard(cfg.familyId); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}}>
                    <ThemedText>Copy</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.inviteAction} onPress={async () => { if (cfg) { await shareText(`Join my family on Kniyotes! Code: ${cfg.familyId}`); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}}>
                    <ThemedText>Share</ThemedText>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setInviteOpen(false)} style={styles.closeBtn}>
                  <ThemedText style={styles.closeText}>Close</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: { gap: 4, paddingTop: 6, paddingBottom: 8 },
  inviteBtn: { backgroundColor: '#ffd166', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8 },
  inviteText: { fontWeight: 'bold' },
  signOutBtn: { backgroundColor: '#eee', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 8 },
  signOutText: { color: '#d32f2f', fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, padding: 28, minWidth: 280, alignItems: 'center', gap: 12 },
  codeLabel: { opacity: 0.7 },
  code: { fontSize: 28, fontWeight: 'bold', letterSpacing: 2, marginVertical: 8 },
  inviteRow: { flexDirection: 'row', gap: 16, marginVertical: 8 },
  inviteAction: { backgroundColor: '#8bf18b', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  closeBtn: { marginTop: 10 },
  closeText: { textDecorationLine: 'underline', opacity: 0.7 },
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
