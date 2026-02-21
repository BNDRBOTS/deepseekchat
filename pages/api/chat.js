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
    
    // 2. Build explicit context
    const contextStr = buildContext(history);
    const systemPrompt = {
      role: 'system',
      content: buildSystemPrompt(contextStr)
    };

    // 3. Construct DeepSeek payload
    const payloadMessages = [systemPrompt, userMessage];

    // 4. Call DeepSeek
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: payloadMessages,
        temperature: 0.0 // Deterministic
      })
    });

    if (!response.ok) throw new Error(`DeepSeek API error: ${response.statusText}`);
    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // 5. Commit turn to unlimited memory
    await addMessage(userId, userMessage);
    await addMessage(userId, assistantMessage);

    res.status(200).json({ reply: assistantMessage.content });
  } catch (error) {
    console.error('CHAT API ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}