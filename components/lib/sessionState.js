// SessionState: user identity, preferences, permissions
export class SessionState {
  constructor(userId) {
    this.userId = userId;
    this.preferences = {
      warmth: 3,              // 1-5 scale [citation:5]
      enthusiasm: 3,          // 1-5 scale
      useHeaders: true,
      useEmojis: true,
      model: 'deepseek-chat',
      temperature: 0.15       // deterministic by default [citation:7]
    };
    this.permissions = [];
    this.createdAt = new Date().toISOString();
    this.lastActive = new Date().toISOString();
  }

  updatePreference(key, value) {
    if (key in this.preferences) {
      this.preferences[key] = value;
      this.lastActive = new Date().toISOString();
    }
  }

  toSummary() {
    // Return only what's needed for context [citation:3]
    return {
      warmth: this.preferences.warmth,
      model: this.preferences.model,
      tone: this.preferences.enthusiasm > 3 ? 'enthusiastic' : 'measured'
    };
  }
}

// TaskState: current goal, materials, constraints [citation:3]
export class TaskState {
  constructor(goal) {
    this.goal = goal;
    this.materials = [];      // uploaded files, references
    this.constraints = [];
    this.steps = [];
    this.createdAt = new Date().toISOString();
    this.completedAt = null;
  }

  addStep(description, required) {
    this.steps.push({
      id: this.steps.length,
      description,
      required,
      status: 'pending',
      result: null,
      error: null
    });
  }

  completeStep(stepId, result) {
    const step = this.steps[stepId];
    if (step) {
      step.status = 'completed';
      step.result = result;
      step.completedAt = new Date().toISOString();
    }
  }

  failStep(stepId, error) {
    const step = this.steps[stepId];
    if (step) {
      step.status = 'failed';
      step.error = error;
    }
  }

  toSummary() {
    return {
      goal: this.goal,
      completedSteps: this.steps.filter(s => s.status === 'completed').length,
      totalSteps: this.steps.length,
      currentStep: this.steps.find(s => s.status === 'pending')
    };
  }
}

// StepState: current operation context [citation:3]
export class StepState {
  constructor(stepId, type) {
    this.stepId = stepId;
    this.type = type;         // 'plan', 'execute', 'verify'
    this.input = null;
    this.output = null;
    this.error = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.startedAt = new Date().toISOString();
    this.completedAt = null;
  }

  setInput(data) {
    this.input = data;
  }

  setOutput(data) {
    this.output = data;
    this.completedAt = new Date().toISOString();
  }

  setError(error) {
    this.error = error;
    this.retryCount++;
  }

  canRetry() {
    return this.retryCount < this.maxRetries;
  }
}
