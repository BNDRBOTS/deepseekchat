import { getSession, saveSession, addMessage, getMessages } from '../../lib/kvStore';
import { buildContext } from '../../lib/contextManager';
import { buildSystemPrompt } from '../../lib/reasoningPrompt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { messages, userId = 'anonymous' } = req.body;
  if (!messages || messages.length === 0) return res.status(400).json({ error: 'No messages' });

  try {
    const userMessage = messages[messages.length - 1];
    
    // 1. Retrieve full history (unlimited)
    const history = await getMessages(userId);
    
    // 2. Build explicit context (Genesis Plan + Working Memory)
    const contextStr = buildContext(history);
    const systemPrompt = {
      role: 'system',
      content: buildSystemPrompt(contextStr)
    };

    const payloadMessages = [systemPrompt, userMessage];

    // 3. DeepSeek Engine with Failsafe Routing
    let assistantMessage;
    try {
      // 25-second absolute timeout failsafe
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: payloadMessages,
          temperature: 0.0 // Deterministic lock, zero hallucination
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API failed: ${response.status} - ${errText}`);
      }
      
      const data = await response.json();
      assistantMessage = data.choices[0].message;
      
    } catch (networkError) {
      console.error('PRIMARY LLM FAILURE:', networkError);
      // Graceful degradation fallback - do not crash the UI, log the failure state
      assistantMessage = {
        role: 'assistant',
        content: `[SYSTEM FAILSAFE TRIGGERED]: Primary reasoning engine timed out or failed. State preserved. Error: ${networkError.message}`
      };
    }

    // 4. Commit turn to unlimited memory (Audit Log)
    // Even if it failed, we log the failure to memory
    await addMessage(userId, userMessage);
    await addMessage(userId, assistantMessage);

    res.status(200).json({ reply: assistantMessage.content });
    
  } catch (error) {
    console.error('FATAL CHAT API ERROR:', error);
    res.status(500).json({ error: 'Fatal system error. State preserved.', details: error.message });
  }
}