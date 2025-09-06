import { useCallback, useEffect, useRef, useState } from 'react';
import { ListItem } from './storage';
import { getSupabase } from './supabase';
import { nanoid } from './utils';

export function useSharedList(familyId?: string | null) {
  const [items, setLocal] = useState<ListItem[]>([]);
  const polling = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!familyId) return;
    const supa = getSupabase();
    let sub: any;
    const fetchItems = async () => {
      if (!supa) return;
      const { data, error } = await supa.from('items').select('*').eq('family_id', familyId).order('created_at', { ascending: true });
      if (!error && data) {
        const mapped: ListItem[] = data.map((d: any) => ({ id: d.id, title: d.title, done: d.done, addedBy: d.added_by, createdAt: new Date(d.created_at).getTime() }));
        setLocal(mapped);
      }
    };
    fetchItems();
    // Real-time subscription
    if (supa) {
      sub = supa.channel('items-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `family_id=eq.${familyId}` }, fetchItems)
        .subscribe();
    }
    return () => { if (sub && supa) supa.removeChannel(sub); };
  }, [familyId]);

  const addItem = useCallback(async (title: string, addedBy: string) => {
    if (!familyId) return;
    const it: ListItem = { id: nanoid(10), title, done: false, addedBy, createdAt: Date.now() };
    setLocal([...items, it]);
    const supa = getSupabase();
    if (supa) {
      await supa.from('items').insert({ id: it.id, family_id: familyId, title: it.title, done: it.done, added_by: it.addedBy, created_at: new Date(it.createdAt).toISOString() });
    }
  }, [familyId, items]);

  const toggleItem = useCallback(async (id: string) => {
    if (!familyId) return;
    const next = items.map(i => i.id === id ? { ...i, done: !i.done } : i);
    setLocal(next);
    const supa = getSupabase();
    if (supa) {
      const it = next.find(i => i.id === id);
      if (it) await supa.from('items').update({ done: it?.done }).eq('id', id);
    }
  }, [familyId, items]);

  const removeItem = useCallback(async (id: string) => {
    if (!familyId) return;
    setLocal(items.filter(i => i.id !== id));
    const supa = getSupabase();
    if (supa) {
      await supa.from('items').delete().eq('id', id);
    }
  }, [familyId, items]);

  return { items, addItem, toggleItem, removeItem };
}
