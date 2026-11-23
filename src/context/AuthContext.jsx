import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // الوضع التجريبي
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadProfile(id) {
    const { data } = await supabase.from('user_profiles').select('*').eq('id', id).single();
    setProfile(data);
  }

  async function signIn(email, password) {
    if (!isSupabaseConfigured) {
      const demo = mockUsers.find((u) => u.email === email) || mockUsers[0];
      setUser({ id: demo.id, email: demo.email });
      setProfile(demo);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    if (!isSupabaseConfigured) { setUser(null); setProfile(null); return; }
    await supabase.auth.signOut();
  }

  async function signInDemo(userId) {
    const demo = mockUsers.find((u) => u.id === userId);
    if (demo) { setUser({ id: demo.id, email: demo.email }); setProfile(demo); }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, signInDemo }}>
      {children}
    </AuthContext.Provider>
  );
}