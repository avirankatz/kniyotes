export async function removeFamilyConfig() {
  await AsyncStorage.removeItem(FAMILY_KEY);
}
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAMILY_KEY = 'kniyotes.family';
const ITEMS_PREFIX = 'kniyotes.items.'; // per family

export type FamilyConfig = { familyId: string; memberName: string };
export type ListItem = { id: string; title: string; done: boolean; addedBy: string; createdAt: number };

export async function getFamilyConfig(): Promise<FamilyConfig | null> {
  const raw = await AsyncStorage.getItem(FAMILY_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setFamilyConfig(cfg: FamilyConfig) {
  await AsyncStorage.setItem(FAMILY_KEY, JSON.stringify(cfg));
}

export async function getItems(familyId: string): Promise<ListItem[]> {
  const raw = await AsyncStorage.getItem(ITEMS_PREFIX + familyId);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function setItems(familyId: string, items: ListItem[]) {
  await AsyncStorage.setItem(ITEMS_PREFIX + familyId, JSON.stringify(items));
}
