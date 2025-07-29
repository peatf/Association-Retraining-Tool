// Environment configuration for Clarity Canvas
// Supports dev/staging/prod content branches and feature flags

class EnvironmentConfig {
  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  loadConfiguration() {
    // Default configuration
    const defaultConfig = {
      // Content pipeline settings
      CONTENT_INDEX_PATH: './public/content/content-index.bin',
      CONTENT_BASE_URL: './content/raw/',
      
      // Canvas settings
      CANVAS_ENABLED: true,
      CANVAS_LANES: 3,
      CANVAS_MOBILE_BREAKPOINT: 768,
      
      // Performance settings
      MAX_BUNDLE_SIZE: 15 * 1024 * 1024, // 15MB
      LAZY_LOADING_ENABLED: true,
      
      // Feature flags for gradual rollout
      FEATURE_FLAGS: {
        REACT_CANVAS: true, // Enable for testing - will be controlled per environment
        THOUGHT_MINING: false,
        HIERARCHICAL_PICKER: false,
        ADVANCED_ANIMATIONS: true,
        ERROR_REPORTING: false
      },
      
      // Environment detection
      NODE_ENV: this.detectEnvironment(),
      
      // Content branch selection
      CONTENT_BRANCH: this.getContentBranch(),
      
      // A/B testing configuration
      AB_TESTING: {
        enabled: false,
        userId: this.generateUserId(),
        experiments: {}
      }
    };

    // Override with environment-specific settings
    const envOverrides = this.getEnvironmentOverrides();
    
    return { ...defaultConfig, ...envOverrides };
  }

  detectEnvironment() {
    // Detect environment from various sources
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV || 'development';
    }
    
    // Browser environment detection
    const hostname = window?.location?.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    } else if (hostname?.includes('staging') || hostname?.includes('dev')) {
      return 'staging';
    }
    
    return 'production';
  }

  getContentBranch() {
    const env = this.detectEnvironment();
    
    // Map environments to content branches
    const branchMap = {
      development: 'dev',
      staging: 'staging', 
      production: 'main'
    };
    
    return branchMap[env] || 'main';
  }

  getEnvironmentOverrides() {
    const env = this.detectEnvironment();
    
    const overrides = {
      development: {
        FEATURE_FLAGS: {
          REACT_CANVAS: true, // Enable in dev for testing
          THOUGHT_MINING: true,
          HIERARCHICAL_PICKER: true,
          ERROR_REPORTING: true
        },
        CONTENT_INDEX_PATH: './public/content/content-index.bin'
      },
      
      staging: {
        FEATURE_FLAGS: {
          REACT_CANVAS: true, // Enable in staging for testing
          THOUGHT_MINING: true,
          HIERARCHICAL_PICKER: false, // Gradual rollout
          ERROR_REPORTING: true
        }
      },
      
      production: {
        FEATURE_FLAGS: {
          REACT_CANVAS: false, // Start disabled in production
          THOUGHT_MINING: false,
          HIERARCHICAL_PICKER: false,
          ERROR_REPORTING: true
        }
      }
    };

    return overrides[env] || {};
  }

  generateUserId() {
    // Generate anonymous user ID for A/B testing
    // Uses localStorage to persist across sessions
    let userId = localStorage.getItem('clarity_canvas_user_id');
    
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('clarity_canvas_user_id', userId);
    }
    
    return userId;
  }

  validateConfiguration() {
    const required = [
      'CONTENT_INDEX_PATH',
      'CONTENT_BASE_URL',
      'NODE_ENV'
    ];

    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment configuration: ${missing.join(', ')}`);
    }

    // Validate content index path exists (in browser environment)
    if (typeof window !== 'undefined') {
      this.validateContentIndex();
    }
  }

  async validateContentIndex() {
    try {
      const response = await fetch(this.config.CONTENT_INDEX_PATH, { method: 'HEAD' });
      if (!response.ok) {
        console.warn(`Content index not found at ${this.config.CONTENT_INDEX_PATH}. Content pipeline may need to be rebuilt.`);
      }
    } catch (error) {
      console.warn('Content index validation failed:', error.message);
    }
  }

  // Public API methods
  get(key) {
    return this.config[key];
  }

  getFeatureFlag(flagName) {
    return this.config.FEATURE_FLAGS[flagName] || false;
  }

  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  getContentPath(filename) {
    return `${this.config.CONTENT_BASE_URL}${filename}`;
  }

  // A/B testing methods
  isInExperiment(experimentName) {
    if (!this.config.AB_TESTING.enabled) {
      return false;
    }
    
    const experiment = this.config.AB_TESTING.experiments[experimentName];
    if (!experiment) {
      return false;
    }
    
    // Simple hash-based assignment
    const userId = this.config.AB_TESTING.userId;
    const hash = this.simpleHash(userId + experimentName);
    return (hash % 100) < experiment.percentage;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Feature flag override for testing
  setFeatureFlag(flagName, value) {
    if (this.isDevelopment()) {
      this.config.FEATURE_FLAGS[flagName] = value;
      console.log(`Feature flag ${flagName} set to ${value}`);
    } else {
      console.warn('Feature flags can only be overridden in development environment');
    }
  }

  // Export configuration for debugging
  exportConfig() {
    if (this.isDevelopment()) {
      return { ...this.config };
    }
    
    // In production, only export non-sensitive config
    const { FEATURE_FLAGS, NODE_ENV, CONTENT_BRANCH } = this.config;
    return { FEATURE_FLAGS, NODE_ENV, CONTENT_BRANCH };
  }
}

// Create singleton instance
const environmentConfig = new EnvironmentConfig();

// Export both the class and instance
export { EnvironmentConfig };
export default environmentConfig;