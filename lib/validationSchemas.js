// JSON Schema for generative parsing [citation:7]
export const entityResolutionSchema = {
  type: 'object',
  properties: {
    entityName: { type: 'string' },
    entityId: { type: 'string' },
    evidenceSpans: { 
      type: 'array',
      items: { type: 'string' }
    },
    confidence: { 
      type: 'number',
      minimum: 0,
      maximum: 1
    }
  },
  required: ['entityName', 'entityId', 'evidenceSpans', 'confidence']
};

// Classification schema with leaf-node enforcement [citation:7]
export const classificationSchema = {
  type: 'object',
  properties: {
    rationale: { type: 'string' },
    path: { 
      type: 'string',
      pattern: '^[A-Za-z_]+ > [A-Za-z_]+( > [A-Za-z_]+)?$'  // enforce hierarchy
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1
    },
    status: {
      type: 'string',
      enum: ['ACCEPTED', 'REJECTED', 'NEEDS_REVIEW']
    }
  },
  required: ['rationale', 'path', 'confidence', 'status']
};

// Risk scoring schema [citation:7]
export const riskScoreSchema = {
  type: 'object',
  properties: {
    reasoning: { type: 'string' },
    triageCategory: {
      type: 'string',
      enum: ['SECURITY_INCIDENT', 'COMPLIANCE_ISSUE', 'GENERAL_INQUIRY', 'FEATURE_REQUEST']
    },
    interactionStyle: {
      type: 'string',
      enum: ['URGENT', 'PROFESSIONAL', 'CASUAL', 'FRUSTRATED']
    },
    riskScore: {
      type: 'integer',
      minimum: 0,
      maximum: 100
    }
  },
  required: ['reasoning', 'triageCategory', 'interactionStyle', 'riskScore']
};

// Compliance gap analysis schema [citation:7]
export const complianceSchema = {
  type: 'object',
  properties: {
    section: { type: 'string' },
    status: {
      type: 'string',
      enum: ['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT']
    },
    evidence: { type: 'string' },  // exact quote required
    gap: { type: 'string' },
    recommendation: { type: 'string' }
  },
  required: ['section', 'status', 'evidence']
};

// Memory recall validation [citation:2]
export const memoryRecallSchema = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    context: { type: 'string' },
    timestamp: { type: 'string' },
    sourceChatId: { type: 'string' }
  },
  required: ['found', 'confidence']
};
