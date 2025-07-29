import rollout from './rollout.js';

const featureFlags = {
  useReactCanvas: Math.random() < rollout.percentage / 100,
};

export default featureFlags;
