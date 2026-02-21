import { getSession } from '../../lib/kvStore';

export default async function handler(req, res) {
  try {
    const test = await getSession('health-check');
    res.status(200).json({ status: 'ok', kv_connected: true });
  } catch (e) {
    res.status(500).json({ status: 'error', kv_connected: false, detail: e.message });
  }
}