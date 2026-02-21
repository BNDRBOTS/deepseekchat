import { kv } from '@vercel/kv';

// Increase from 100 to effectively unlimited within KV constraints (10,000 limits for safety)
const MAX_MESSAGES = 10000;

export async function getSession(userId) {
  try {
    const session = await kv.get(`session:${userId}`);
    return session || null;
  } catch (e) {
    console.error(`KV GET ERROR (session:${userId}):`, e);
    return null;
  }
}

export async function saveSession(userId, sessionData) {
  try {
    await kv.set(`session:${userId}`, sessionData);
  } catch (e) {
    console.error(`KV SET ERROR (session:${userId}):`, e);
  }
}

export async function addMessage(userId, message) {
  const key = `messages:${userId}`;
  try {
    // Audit log push - append only 
    await kv.rpush(key, message);
    
    // Prune only if extremely large to prevent OOM
    const len = await kv.llen(key);
    if (len > MAX_MESSAGES) {
      // Keep the most recent MAX_MESSAGES
      await kv.lpop(key, len - MAX_MESSAGES);
    }
  } catch (e) {
    console.error(`KV RPUSH ERROR (${key}):`, e);
  }
}

export async function getMessages(userId) {
  try {
    const messages = await kv.lrange(`messages:${userId}`, 0, -1);
    return messages || [];
  } catch (e) {
    console.error(`KV LRANGE ERROR (messages:${userId}):`, e);
    return [];
  }
}

export async function getMemoryState(userId) {
  // Read-only state inspector for forensics
  try {
    const len = await kv.llen(`messages:${userId}`);
    return { count: len || 0 };
  } catch (e) {
    return { error: e.message };
  }
}