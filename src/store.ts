import fs from 'fs';
import path from 'path';
import { CFELState, createInitialState } from './engine.js';
import { createDemoState } from './demo-data.js';
import { serializeBigInts, deserializeCFELState } from './serialize.js';

export interface StateStore {
  load(): Promise<CFELState>;
  save(state: CFELState): Promise<void>;
  reset(): Promise<void>;
}

export class JsonFileStore implements StateStore {
  private filePath: string;
  private initialCapital: bigint;

  constructor(filePath: string, initialCapital: bigint = 0n) {
    this.filePath = filePath;
    this.initialCapital = initialCapital;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) {
      // Fresh install - create demo workspace
      const demoState = createDemoState();
      fs.writeFileSync(filePath, JSON.stringify(serializeBigInts(demoState), null, 2));
    }
  }

  async load(): Promise<CFELState> {
    return deserializeCFELState(JSON.parse(fs.readFileSync(this.filePath, 'utf-8')));
  }

  async save(state: CFELState): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(serializeBigInts(state), null, 2));
    fs.renameSync(tempPath, this.filePath);
  }

  async reset(): Promise<void> {
    const demoState = createDemoState();
    fs.writeFileSync(this.filePath, JSON.stringify(serializeBigInts(demoState), null, 2));
  }
}

export class InMemoryStore implements StateStore {
  private state: CFELState;
  constructor(initialState: CFELState) { this.state = initialState; }
  async load(): Promise<CFELState> { return this.state; }
  async save(state: CFELState): Promise<void> { this.state = state; }
  async reset(): Promise<void> { this.state = createDemoState(); }
}
