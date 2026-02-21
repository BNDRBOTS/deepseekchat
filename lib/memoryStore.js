import { supabase } from './supabaseClient';

/**
 * Forensic-grade memory store backed by Supabase.
 * Every message is logged with timestamp, immutable audit trail.
 */

export async function getSession(userId) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (e) {
    console.error(`SUPABASE GET SESSION ERROR (${userId}):`, e);
    return null;
  }
}

export async function saveSession(userId, sessionData) {
  try {
    const { error } = await supabase
      .from('sessions')
      .upsert({ user_id: userId, data: sessionData, updated_at: new Date().toISOString() });
    
    if (error) throw error;
  } catch (e) {
    console.error(`SUPABASE SAVE SESSION ERROR (${userId}):`, e);
  }
}

export async function addMessage(userId, message) {
  try {
    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || new Date().toISOString()
      });
    
    if (error) throw error;
  } catch (e) {
    console.error(`SUPABASE ADD MESSAGE ERROR (${userId}):`, e);
  }
}

export async function getMessages(userId) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error(`SUPABASE GET MESSAGES ERROR (${userId}):`, e);
    return [];
  }
}

export async function getMemoryState(userId) {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (error) throw error;
    return { count: count || 0 };
  } catch (e) {
    return { error: e.message };
  }
}