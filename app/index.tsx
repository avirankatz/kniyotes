import { getFamilyConfig } from '@/lib/storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const [route, setRoute] = useState<'loading' | 'onboarding' | 'list'>('loading');

  useEffect(() => {
    (async () => {
      const cfg = await getFamilyConfig();
  setRoute(cfg ? 'list' : 'onboarding');
    })();
  }, []);

  if (route === 'loading') return null;
  if (route === 'onboarding') return <Redirect href="/onboarding" />;
  return <Redirect href="/list" />;
}
