import disc from './disc.js';
import nineBox from './nineBox.js';

export const MODEL_REGISTRY = {
  [disc.key]: disc,
  [nineBox.key]: nineBox,
};

export function listModels() {
  return Object.values(MODEL_REGISTRY);
}

export function getModelDefinition(key) {
  return MODEL_REGISTRY[key] || null;
}
