import { CFELState, createInitialState } from './engine.js';
import { StateStore } from './store.js';

export interface Organization { id: string; name: string; isActive: boolean; apiKeys: string[]; capitalCeiling: bigint | null; }

export class InMemoryTenantRegistry {
  private orgs: Map<string, Organization> = new Map();
  createOrganization(name: string, capitalCeiling?: bigint): Organization {
    const id = crypto.randomUUID();
    const org: Organization = { id, name, isActive: true, apiKeys: [crypto.randomUUID()], capitalCeiling: capitalCeiling || null };
    this.orgs.set(id, org);
    return org;
  }
  getByApiKey(apiKey: string): Organization | undefined {
    for (const org of this.orgs.values()) if (org.apiKeys.includes(apiKey) && org.isActive) return org;
    return undefined;
  }
}

// Separated from StateStore to prevent TS signature mismatches
export class TenantStateStore {
  private stores: Map<string, StateStore> = new Map();
  registerStore(orgId: string, store: StateStore) { this.stores.set(orgId, store); }
  async load(orgId: string): Promise<CFELState> { return (this.stores.get(orgId) || new (await import('./store.js')).InMemoryStore(createInitialState(0n))).load(); }
  async save(orgId: string, state: CFELState): Promise<void> { return this.stores.get(orgId)?.save(state) || Promise.resolve(); }
}
