import { CFELState } from './engine.js';

// Safely tag BigInts to prevent numeric string corruption (e.g. names like "123 Builders")
export function serializeBigInts(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return { __bi: obj.toString() };
  if (Array.isArray(obj)) return obj.map(serializeBigInts);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeBigInts(value);
    }
    return result;
  }
  return obj;
}

export function deserializeCFELState(data: unknown): CFELState {
  function deserialize(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'object' && (obj as any).__bi) return BigInt((obj as any).__bi);
    if (Array.isArray(obj)) return obj.map(deserialize);
    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        result[key] = deserialize(value);
      }
      return result;
    }
    return obj;
  }
  return deserialize(data) as CFELState;
}
