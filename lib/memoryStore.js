// lib/kvStore.js
import { kv } from '@vercel/kv';

export async function getSession(userId) {
  const session = await kv.get(`session:${userId}`);
  return session || null;
}

export async function saveSession(userId, sessionData) {
  await kv.set(`session:${userId}`, sessionData);
}

export async function addMessage(userId, message) {
  const key = `messages:${userId}`;
  const messages = await kv.lrange(key, 0, -1) || [];
  messages.push(message);
  // Keep only last 100 messages per user
  if (messages.length > 100) messages.shift();
  await kv.del(key);
  await kv.rpush(key, ...messages);
}

export async function getMessages(userId) {
  return await kv.lrange(`messages:${userId}`, 0, -1) || [];
}
