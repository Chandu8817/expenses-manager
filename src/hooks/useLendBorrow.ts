import { useState, useEffect } from 'react';
import { supabase, LendBorrowRecord } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const useLendBorrow = (user: User) => {
  const [records, setRecords] = useState<LendBorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lend_borrow_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (recordData: Omit<LendBorrowRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('lend_borrow_records')
        .insert([{ ...recordData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateRecord = async (id: string, updates: Partial<LendBorrowRecord>) => {
    try {
      const { data, error } = await supabase
        .from('lend_borrow_records')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => prev.map(record => record.id === id ? data : record));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lend_borrow_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [user.id]);

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
  };
};