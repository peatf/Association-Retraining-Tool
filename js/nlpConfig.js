/**
 * NLP Configuration for Transformers.js
 * Privacy-first configuration with local-only model hosting
 */

// Candidate labels for zero-shot text classification
// These represent psychological states and concerns for therapeutic intervention
export const candidateLabels = [
    "feeling of worthlessness",
    "anxiety about the future", 
    "lack of motivation",
    "conflict between desire and action",
    "self-criticism",
    "fear of failure",
    "financial scarcity mindset",
    "loneliness in relationships",
    "imposter syndrome",
    "procrastination due to feeling overwhelmed",
    "perfectionism paralysis",
    "social comparison anxiety",
    "rejection sensitivity",
    "abandonment fears",
    "career dissatisfaction",
    "body image concerns",
    "relationship conflict avoidance",
    "decision-making paralysis",
    "chronic self-doubt",
    "emotional numbness"
];

// Model configuration for privacy-first operation
export const modelConfig = {
    modelName: "Xenova/nli-deberta-v3-base",
    localModelPath: "/public/models/",
    allowRemoteModels: false, // Critical: prevents external network requests
    multiLabel: true,
    device: 'auto', // Use GPU if available, fallback to CPU
    quantized: true // Use quantized models for better performance
};

// Confidence threshold for classification
export const confidenceThreshold = 0.45;

// Transformers.js environment configuration
export const transformersConfig = {
    // Disable remote models for privacy-first operation (models are cached locally)
    allowRemoteModels: false,
    // Use local model cache directory
    localModelPath: './public/models/',
    // Progress callback for model loading
    progressCallback: null // Will be set by the pipeline manager
};

export default {
    candidateLabels,
    modelConfig,
    confidenceThreshold,
    transformersConfig
};