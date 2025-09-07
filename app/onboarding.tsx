import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import '@/lib/i18n';
import { getFamilyConfig, setFamilyConfig } from '@/lib/storage';
import { getSupabase } from '@/lib/supabase';
import { nanoid } from '@/lib/utils';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

export default function Onboarding() {
  const router = useRouter();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const cfg = await getFamilyConfig();
      if (cfg) router.replace('/list');
    })();
  }, [router]);

  const onChoose = (m: 'create' | 'join') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setMode(m);
  };

  const onSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(t('yourName'), t('yourName'));
      return;
    }
    let familyId = code.trim();
    const supa = getSupabase();
    if (mode === 'create') {
      familyId = nanoid(6).toUpperCase();
      if (supa) {
        const { error: famErr } = await supa.from('families').insert({ id: familyId });
        if (famErr) {
          Alert.alert('Error', t('familyCode'));
          return;
        }
        const { error: memErr } = await supa.from('members').insert({ family_id: familyId, name: name.trim() });
        if (memErr) {
          Alert.alert('Error', t('yourName'));
          return;
        }
      }
    } else {
      if (!familyId) {
        Alert.alert(t('familyCode'), t('familyCode'));
        return;
      }
      if (supa) {
        const { data: fam, error: famErr } = await supa.from('families').select('id').eq('id', familyId).single();
        if (famErr || !fam) {
          Alert.alert('Not found', t('familyCode'));
          return;
        }
        const { error: memErr } = await supa.from('members').insert({ family_id: familyId, name: name.trim() });
        if (memErr) {
          Alert.alert('Error', t('yourName'));
          return;
        }
      }
    }
    await setFamilyConfig({ familyId, memberName: name.trim() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/list');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>{t('appTitle')}</ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>{t('appSubtitle')}</ThemedText>

        {mode === 'choose' && (
          <View style={styles.choices}>
            <Pressable onPress={() => onChoose('create')} style={({ pressed }) => [styles.cta, styles.create, pressed && styles.pressed]}>
              <ThemedText type="defaultSemiBold" style={styles.ctaText}>{t('createFamily')}</ThemedText>
              <ThemedText style={styles.ctaHint}>{t('createFamilyHint')}</ThemedText>
            </Pressable>
            <Pressable onPress={() => onChoose('join')} style={({ pressed }) => [styles.cta, styles.join, pressed && styles.pressed]}>
              <ThemedText type="defaultSemiBold" style={styles.ctaText}>{t('joinFamily')}</ThemedText>
              <ThemedText style={styles.ctaHint}>{t('joinFamilyHint')}</ThemedText>
            </Pressable>
          </View>
        )}

        {mode !== 'choose' && (
          <View style={styles.form}>
            <ThemedText style={styles.label}>{t('yourName')}</ThemedText>
            <TextInput
              placeholder={t('namePlaceholder')}
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoFocus
            />
            {mode === 'join' && (
              <>
                <ThemedText style={styles.label}>{t('familyCode')}</ThemedText>
                <TextInput
                  placeholder={t('codePlaceholder')}
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  value={code}
                  onChangeText={setCode}
                  style={styles.input}
                />
              </>
            )}
            {mode === 'create' && (
              <ThemedText style={styles.hint}>{t('codeGenerated')}</ThemedText>
            )}
            <Pressable onPress={onSubmit} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}>
              <ThemedText type="defaultSemiBold" style={styles.primaryText}>{mode === 'create' ? t('create') : t('join')}</ThemedText>
            </Pressable>
            <Pressable onPress={() => setMode('choose')}>
              <ThemedText style={styles.back}>{t('back')}</ThemedText>
            </Pressable>
          </View>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  title: { fontSize: 42,lineHeight: 42 },
  subtitle: { opacity: 0.8 },
  choices: { width: '100%', gap: 14 },
  cta: { padding: 18, borderRadius: 18 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  create: { backgroundColor: '#8bf18b' },
  join: { backgroundColor: '#8bdcf1' },
  ctaText: { fontSize: 18 },
  ctaHint: { opacity: 0.8 },
  form: { width: '100%', gap: 10 },
  label: { opacity: 0.8 },
  input: { backgroundColor: 'rgba(0,0,0,0.05)', padding: 14, borderRadius: 14, fontSize: 16 },
  hint: { opacity: 0.8 },
  primary: { backgroundColor: '#ffd166', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 4 },
  primaryText: { fontSize: 18 },
  back: { textAlign: 'center', marginTop: 10, textDecorationLine: 'underline', opacity: 0.8 },
});
