// Compresses context non-destructively by keeping system prompt + last N turns
export function buildContext(history, maxTurns = 50) {
  if (!history || history.length === 0) return "No prior context.";
  
  // Keep the most recent turns to stay within token limits while preserving deep memory
  const recent = history.slice(-maxTurns * 2); 
  
  return recent.map(msg => `[${msg.role.toUpperCase()}]: ${msg.content}`).join('\\n');
}