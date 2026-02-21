// Context Builder with Genesis Lock
// Guarantees the original FULL PLAN is never forgotten as history grows

export function buildContext(history) {
  if (!history || history.length === 0) return "No prior context.";
  
  // GENESIS LOCK: Always retain the first 5 interactions (the core plan/setup)
  const genesis = history.slice(0, 5);
  
  // WORKING MEMORY: The 40 most recent turns for immediate context
  const recent = history.slice(-40); 
  
  // Merge and deduplicate (in case total history is less than 45)
  // This uses a Set on object references assuming the array contains unique message objects,
  // but to be safe with KV retrieved objects, we stringify to deduplicate or just index them.
  const uniqueKeys = new Set();
  const merged = [];
  
  const addMsg = (msg) => {
    // simple hash of content to avoid duplicates where genesis overlaps with recent
    const hash = msg.content.substring(0, 50); 
    if (!uniqueKeys.has(hash)) {
      uniqueKeys.add(hash);
      merged.push(msg);
    }
  };

  genesis.forEach(addMsg);
  if (history.length > 5) {
    merged.push({ role: "system", content: "--- [DEEP HISTORY COMPRESSED. SHOWING ORIGINAL PLAN + RECENT CONTEXT] ---" });
  }
  recent.forEach(addMsg);
  
  return merged.map(msg => `[${msg.role?.toUpperCase() || 'SYSTEM'}]: ${msg.content}`).join('\n\n');
}