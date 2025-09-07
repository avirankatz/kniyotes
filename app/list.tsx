import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import '@/lib/i18n';
import { copyToClipboard, shareText } from '@/lib/invite';
import { getFamilyConfig, removeFamilyConfig } from '@/lib/storage';
import { useSharedList } from '@/lib/useSharedList';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, FlatList, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, Pressable, StyleSheet, TextInput, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ListItem = { id: string; title: string; done: boolean; addedBy: string };

const springLayout = () => {
  LayoutAnimation.configureNext({
    duration: 300,
    create: { type: LayoutAnimation.Types.spring, property: LayoutAnimation.Properties.opacity, springDamping: 0.7 },
    update: { type: LayoutAnimation.Types.spring, springDamping: 0.7 },
    delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  });
};

// Reusable pressable with bouncy scale on press
const BouncyButton = ({ children, style, onPress, onLongPress, disabled }: PropsWithChildren<{ style?: any; onPress?: () => void; onLongPress?: () => void; disabled?: boolean }>) => {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  return (
    <Pressable
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
    >
      {({ pressed }) => (
        <Animated.View style={[style, pressed && styles.pressed, { transform: [{ scale }] }]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
};

const ItemRow = ({ item, onToggle, onRemove }: { item: ListItem; onToggle: () => void; onRemove: () => void }) => {
  const { t } = useTranslation();
  // Keep animated values stable across renders
  const scale = useRef(new Animated.Value(1)).current;
  const appear = useRef(new Animated.Value(0)).current;

  // Gentle mount animation for each row
  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const bounce = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, speed: 20, bounciness: 6 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }),
    ]).start();
  };

  const handlePress = () => {
    springLayout();
    onToggle();
    bounce();
  };

  const handleLongPress = () => {
    // Fade and slide up a bit, then remove
    Animated.timing(appear, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      springLayout();
      onRemove();
    });
  };

  return (
    <Pressable onLongPress={handleLongPress} onPress={handlePress}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.item,
            item.done && styles.done,
            pressed && styles.pressed,
            {
              opacity: appear,
              transform: [
                { scale },
                {
                  translateY: appear.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
                },
              ],
            },
          ]}
        > 
          <ThemedText type="defaultSemiBold" style={[styles.itemText, item.done && styles.itemDoneText]}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.meta}>{t('by')} {item.addedBy}</ThemedText>
        </Animated.View>
      )}
    </Pressable>
  );
};

export default function ListScreen() {
  const router = useRouter();
  const [cfg, setCfg] = useState<{ familyId: string; memberName: string } | null>(null);
  useEffect(() => { (async () => setCfg(await getFamilyConfig()))(); }, []);

  const { items, addItem, toggleItem, removeItem } = useSharedList(cfg?.familyId);
  const [text, setText] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
  const header = useMemo(() => (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText type="title">{cfg ? `${t('family')} ${cfg.familyId}` : t('loading')}</ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {cfg && (
            <BouncyButton onPress={() => setInviteOpen(true)} style={styles.inviteBtn}>
              <ThemedText style={styles.inviteText}>{t('invite')}</ThemedText>
            </BouncyButton>
          )}
          <BouncyButton
            onPress={async () => {
              await removeFamilyConfig();
              router.replace('/onboarding');
            }}
            style={styles.signOutBtn}
          >
            <ThemedText style={styles.signOutText}>{t('signOut')}</ThemedText>
          </BouncyButton>
        </View>
      </View>
      {cfg && <ThemedText style={{ opacity: 0.8 }}>{t('hi')} {cfg.memberName} 👋</ThemedText>}
    </View>
  ), [cfg, t]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          {header}
          <View style={styles.row}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t('add') + ' milk, bread…'}
              placeholderTextColor="#999"
              style={styles.input}
              onSubmitEditing={() => {
                if (!text.trim() || !cfg) return;
                springLayout();
                addItem(text.trim(), cfg.memberName);
                setText('');
                Haptics.selectionAsync();
              }}
            />
            <BouncyButton
              onPress={() => {
                if (!text.trim() || !cfg) return;
                springLayout();
                addItem(text.trim(), cfg.memberName);
                setText('');
                Haptics.selectionAsync();
              }}
              style={styles.addBtn}
            >
              <ThemedText type="defaultSemiBold">{t('add')}</ThemedText>
            </BouncyButton>
          </View>
          <FlatList
            data={items}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 60 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <ItemRow
                item={item as ListItem}
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            )}
          />
          {/* Invite Modal */}
          <Modal visible={inviteOpen} animationType="slide" transparent onRequestClose={() => setInviteOpen(false)}>
            <View style={styles.modalBg}>
              <View style={styles.modalCard}>
                <ThemedText type="title">{t('inviteTitle')}</ThemedText>
                <ThemedText style={styles.codeLabel}>{t('familyCodeLabel')}</ThemedText>
                <ThemedText selectable style={styles.code}>{cfg?.familyId}</ThemedText>
                <View style={styles.inviteRow}>
                  <BouncyButton style={styles.inviteAction} onPress={async () => { if (cfg) { await copyToClipboard(cfg.familyId); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}}>
                    <ThemedText>{t('copy')}</ThemedText>
                  </BouncyButton>
                  <BouncyButton style={styles.inviteAction} onPress={async () => { if (cfg) { await shareText(`Join my family on Kniyotes! Code: ${cfg.familyId}`); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}}>
                    <ThemedText>{t('share')}</ThemedText>
                  </BouncyButton>
                </View>
                <BouncyButton onPress={() => setInviteOpen(false)} style={styles.closeBtn}>
                  <ThemedText style={styles.closeText}>{t('close')}</ThemedText>
                </BouncyButton>
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
