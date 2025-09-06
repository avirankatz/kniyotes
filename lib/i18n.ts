
import * as Localization from 'expo-localization';
import * as Updates from 'expo-updates';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

const resources = {
  en: {
    translation: {
      appTitle: 'Kniyotes',
      appSubtitle: 'Shop together, stay in sync.',
      createFamily: 'Create a new family',
      createFamilyHint: 'Get a code to share',
      joinFamily: 'Join existing',
      joinFamilyHint: 'Use a code from your family',
      yourName: 'Your name',
      familyCode: 'Family code',
      codePlaceholder: 'ABC123',
      namePlaceholder: 'Alex',
      codeGenerated: 'We\'ll generate a short code you can share.',
      create: 'Create',
      join: 'Join',
      back: 'Back',
      add: 'Add',
      invite: 'Invite',
      copy: 'Copy',
      share: 'Share',
      close: 'Close',
      signOut: 'Sign Out',
      hi: 'Hi',
      by: 'by',
      loading: 'Loading…',
      family: 'Family',
      inviteTitle: 'Invite to Family',
      familyCodeLabel: 'Family Code:',
      copied: 'Copied to clipboard!',
      shareMsg: 'Join my family on Kniyotes! Code: ',
    },
  },
  he: {
    translation: {
      appTitle: 'קניותס',
      appSubtitle: 'קונים יחד, נשארים מסונכרנים.',
      createFamily: 'צור משפחה חדשה',
      createFamilyHint: 'קבל קוד לשיתוף',
      joinFamily: 'הצטרף למשפחה',
      joinFamilyHint: 'השתמש בקוד מהמשפחה שלך',
      yourName: 'השם שלך',
      familyCode: 'קוד משפחה',
      codePlaceholder: 'אבג123',
      namePlaceholder: 'דנה',
      codeGenerated: 'ניצור עבורך קוד קצר לשיתוף.',
      create: 'צור',
      join: 'הצטרף',
      back: 'חזרה',
      add: 'הוסף',
      invite: 'הזמן',
      copy: 'העתק',
      share: 'שתף',
      close: 'סגור',
      signOut: 'התנתק',
      hi: 'שלום',
      by: 'על ידי',
      loading: 'טוען…',
      family: 'משפחה',
      inviteTitle: 'הזמן למשפחה',
      familyCodeLabel: 'קוד משפחה:',
      copied: 'הועתק ללוח!',
      shareMsg: 'הצטרפו למשפחה שלי באפליקציית קניות! קוד: ',
    },
  },
};

const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
const lng = deviceLocale.match(/he|iw/) ? 'he' : 'en';
if (lng === 'he' && !I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  Updates.reloadAsync();
} else if (lng !== 'he' && I18nManager.isRTL) {
  I18nManager.forceRTL(false);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
