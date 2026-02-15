import { memoryStore } from '../../lib/memoryStore';
import { 
  entityResolutionSchema, 
  classificationSchema, 
  riskScoreSchema,
  complianceSchema,
  memoryRecallSchema 
} from '../../lib/validationSchemas';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    messages, 
    userId = 'anonymous',
    taskId,
    mode = 'chat',           // chat, research, learn, council
    structuredOutput = false,
    schema = null,
    temperature = 0.15       // deterministic by default [citation:7]
  } = req.body;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'DeepSeek API key not configured' });
  }

  try {
    // PLANNER LAYER: Get context and determine approach [citation:3]
    const session = memoryStore.getOrCreateSession(userId);
    const context = memoryStore.getContextSummary(userId, taskId);
    
    // Check memory for relevant past interactions (95% recall target) [citation:2]
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      const memories = memoryStore.recall(lastUserMessage.content.substring(0, 50));
      if (memories.length > 0) {
        // Inject high-confidence memories into context
        context.memories = memories.filter(m => m.confidence > 0.9);
      }
    }

    // Build system prompt with context
    let systemMessage = `You are DeepSeek, a helpful assistant. Current context:
Session: ${JSON.stringify(context.session)}
${context.task ? `Task: ${JSON.stringify(context.task)}` : ''}
${context.memories ? `Relevant memories: ${JSON.stringify(context.memories)}` : ''}`;

    // Mode-specific instructions [citation:2]
    if (mode === 'learn') {
      systemMessage += '\n\nMode: Step-by-step learning. Provide guided questions and hints. Tailor to user knowledge level.';
    } else if (mode === 'research') {
      systemMessage += '\n\nMode: Deep Research. Search multiple sources, synthesize, cite everything.';
    } else if (mode === 'council') {
      systemMessage += '\n\nMode: Model Council. Consider multiple perspectives. Highlight agreements and disagreements.';
    }

    // Structured output enforcement [citation:7]
    if (structuredOutput && schema) {
      systemMessage += '\n\nYou must output valid JSON matching the provided schema. No additional text.';
    }

    // EXECUTOR LAYER: Call model [citation:3]
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMessage },
          ...messages
        ],
        temperature: temperature,  // 0.15 for deterministic [citation:7]
        ...(structuredOutput && {
          response_format: { type: 'json_object' }
        })
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    const assistantMessage = data.choices[0].message.content;

    // VERIFIER LAYER: Validate output [citation:3][citation:7]
    let verifiedOutput = assistantMessage;
    let verificationErrors = [];

    if (structuredOutput && schema) {
      try {
        const parsed = JSON.parse(assistantMessage);
        
        // Validate against schema
        const validate = (obj, schema) => {
          const errors = [];
          for (const required of schema.required || []) {
            if (!obj[required]) {
              errors.push(`Missing required field: ${required}`);
            }
          }
          // Basic type checking
          for (const [key, def] of Object.entries(schema.properties || {})) {
            if (obj[key] !== undefined) {
              if (def.type === 'number' && typeof obj[key] !== 'number') errors.push(`${key} must be number`);
              if (def.type === 'string' && typeof obj[key] !== 'string') errors.push(`${key} must be string`);
              if (def.enum && !def.enum.includes(obj[key])) errors.push(`${key} must be one of: ${def.enum.join(', ')}`);
            }
          }
          return errors;
        };

        verificationErrors = validate(parsed, schema);
        
        if (verificationErrors.length === 0) {
          // Store as memory if high confidence [citation:2]
          if (parsed.confidence > 0.9) {
            memoryStore.createMemory(
              `interaction-${Date.now()}`,
              parsed,
              parsed.confidence
            );
          }
          
          verifiedOutput = parsed;
        } else {
          // Degrade gracefully [citation:3]
          verifiedOutput = {
            error: 'Validation failed',
            details: verificationErrors,
            raw: assistantMessage
          };
        }
      } catch (e) {
        verificationErrors = [`Invalid JSON: ${e.message}`];
        verifiedOutput = {
          error: 'Invalid JSON output',
          raw: assistantMessage
        };
      }
    }

    // Record interaction for future recall [citation:2]
    memoryStore.recordInteraction(userId, lastUserMessage?.content, {
      mode,
      taskId,
      verificationErrors: verificationErrors.length > 0 ? verificationErrors : undefined
    });

    // Return with verification results
    res.status(200).json({
      reply: typeof verifiedOutput === 'string' ? verifiedOutput : JSON.stringify(verifiedOutput),
      structured: structuredOutput ? verifiedOutput : undefined,
      verification: verificationErrors.length > 0 ? {
        passed: false,
        errors: verificationErrors
      } : {
        passed: true
      },
      memoryRecall: context.memories ? {
        count: context.memories.length,
        confidence: context.memories.reduce((acc, m) => acc + m.confidence, 0) / context.memories.length
      } : null
    });

  } catch (error) {
    console.error('DeepSeek API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch from DeepSeek',
      details: error.message 
    });
  }
}
