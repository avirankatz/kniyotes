import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export async function copyToClipboard(text: string) {
  await Clipboard.setStringAsync(text);
}

export async function shareText(text: string) {
  if (await Sharing.isAvailableAsync()) {
    // Fallback: create a temporary file if needed, but for now just copy to clipboard and alert
    await Clipboard.setStringAsync(text);
    Alert.alert('Share', 'Family code copied to clipboard. Paste it anywhere to invite!');
  } else {
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(text);
      alert('Copied to clipboard!');
    } else {
      Alert.alert('Sharing not available', 'Copied to clipboard instead.');
      await Clipboard.setStringAsync(text);
    }
  }
}
