import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import * as mock from '../data/mockData';

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [banks, setBanks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setBanks(mock.mockBanks);
      setCategories(mock.mockCategories);
      setActivities(mock.mockActivities);
      setTransactions(mock.mockTransactions);
      setAuditLogs(mock.mockAuditLogs);
      setUsers(mock.mockUsers);
      setLoading(false);
      return;
    }
    const [b, c, a, t, l, u] = await Promise.all([
      supabase.from('bank_accounts').select('*').order('created_at'),
      supabase.from('categories').select('*').order('name'),
      supabase.from('activities').select('*').order('activity_date', { ascending: false }),
      supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('user_profiles').select('*').order('created_at'),
    ]);
    setBanks(b.data || []); setCategories(c.data || []); setActivities(a.data || []);
    setTransactions(t.data || []); setAuditLogs(l.data || []); setUsers(u.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user, loadAll]);

  function monthOf(record) {
    return (record?.transaction_date || record?.activity_date || record?.created_at || '').slice(0, 7);
  }

  async function addTransaction(payload) {
    if (!isSupabaseConfigured) {
      setTransactions((p) => [{ ...payload, id: `t${Date.now()}` }, ...p]);
      return { error: null };
    }
    const { error } = await supabase.from('transactions').insert(payload);
    if (!error) loadAll();
    return { error };
  }
  async function updateTransaction(id, payload) {
    if (!isSupabaseConfigured) {
      setTransactions((p) => p.map((x) => (x.id === id ? { ...x, ...payload } : x)));
      return { error: null };
    }
    const { error } = await supabase.from('transactions').update(payload).eq('id', id);
    if (!error) loadAll();
    return { error };
  }
  async function deleteTransaction(id) {
    if (!isSupabaseConfigured) { setTransactions((p) => p.filter((x) => x.id !== id)); return { error: null }; }
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) loadAll();
    return { error };
  }

  async function addBank(payload) {
    if (!isSupabaseConfigured) {
      setBanks((p) => [...p, { ...payload, id: `b${Date.now()}` }]);
      return { error: null };
    }
    const { error } = await supabase.from('bank_accounts').insert(payload);
    if (!error) loadAll();
    return { error };
  }
  async function updateBank(id, payload) {
    if (!isSupabaseConfigured) { setBanks((p) => p.map((x) => (x.id === id ? { ...x, ...payload } : x))); return { error: null }; }
    const { error } = await supabase.from('bank_accounts').update(payload).eq('id', id);
    if (!error) loadAll();
    return { error };
  }
  async function deleteBank(id) {
    if (!isSupabaseConfigured) { setBanks((p) => p.filter((x) => x.id !== id)); return { error: null }; }
    const { error } = await supabase.from('bank_accounts').delete().eq('id', id);
    if (!error) loadAll();
    return { error };
  }

  async function addActivity(payload) {
    if (!isSupabaseConfigured) { setActivities((p) => [{ ...payload, id: `act${Date.now()}` }, ...p]); return { error: null }; }
    const { error } = await supabase.from('activities').insert(payload);
    if (!error) loadAll();
    return { error };
  }
  async function updateActivity(id, payload) {
    if (!isSupabaseConfigured) { setActivities((p) => p.map((x) => (x.id === id ? { ...x, ...payload } : x))); return { error: null }; }
    const { error } = await supabase.from('activities').update(payload).eq('id', id);
    if (!error) loadAll();
    return { error };
  }
  async function deleteActivity(id) {
    if (!isSupabaseConfigured) { setActivities((p) => p.filter((x) => x.id !== id)); return { error: null }; }
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (!error) loadAll();
    return { error };
  }

  async function addCategory(payload) {
    if (!isSupabaseConfigured) { setCategories((p) => [...p, { ...payload, id: `cat${Date.now()}` }]); return { error: null }; }
    const { error } = await supabase.from('categories').insert(payload);
    if (!error) loadAll();
    return { error };
  }
  async function deleteCategory(id) {
    if (!isSupabaseConfigured) { setCategories((p) => p.filter((x) => x.id !== id)); return { error: null }; }
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) loadAll();
    return { error };
  }

  async function updateUserPermissions(id, permissions) {
    if (!isSupabaseConfigured) { setUsers((p) => p.map((x) => (x.id === id ? { ...x, permissions } : x))); return { error: null }; }
    const { error } = await supabase.from('user_profiles').update({ permissions }).eq('id', id);
    if (!error) loadAll();
    return { error };
  }

  function calculateBankBalance(bankId) {
    const bank = banks.find((b) => b.id === bankId);
    if (!bank) return 0;
    const txns = transactions.filter((t) => t.bank_account_id === bankId || t.to_bank_account_id === bankId);
    return txns.reduce((balance, t) => {
      if (t.type === 'income' && t.bank_account_id === bankId) return balance + Number(t.amount);
      if (t.type === 'expense' && t.bank_account_id === bankId) return balance - Number(t.amount);
      if (t.type === 'transfer') {
        if (t.bank_account_id === bankId) return balance - Number(t.amount);
        if (t.to_bank_account_id === bankId) return balance + Number(t.amount);
      }
      return balance;
    }, Number(bank.opening_balance));
  }

  function getBankTotals() {
    return banks.map((b) => ({
      ...b,
      current_balance: calculateBankBalance(b.id),
      total_income: transactions
        .filter((t) => t.type === 'income' && t.bank_account_id === b.id)
        .reduce((s, t) => s + Number(t.amount), 0),
      total_expense: transactions
        .filter((t) => t.type === 'expense' && t.bank_account_id === b.id)
        .reduce((s, t) => s + Number(t.amount), 0),
    }));
  }

  return (
    <DataContext.Provider value={{
      banks, categories, activities, transactions, auditLogs, users, loading,
      addTransaction, updateTransaction, deleteTransaction,
      addBank, updateBank, deleteBank,
      addActivity, updateActivity, deleteActivity,
      addCategory, deleteCategory,
      updateUserPermissions,
      calculateBankBalance, getBankTotals,
      monthOf,
      reload: loadAll,
    }}>
      {children}
    </DataContext.Provider>
  );
}