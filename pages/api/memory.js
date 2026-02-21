import { getMemoryState } from '../../lib/kvStore';

export default async function handler(req, res) {
  const userId = req.query.userId || 'anonymous';
  const state = await getMemoryState(userId);
  res.status(200).json({ userId, memory_state: state });
}