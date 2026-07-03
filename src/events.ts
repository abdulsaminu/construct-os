export type DomainEvent = { type: string; [key: string]: any };
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  subscribe<T extends DomainEvent>(type: T['type'], handler: EventHandler<T>) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler as EventHandler);
  }
  async publish(event: DomainEvent) {
    for (const handler of (this.handlers.get(event.type) || [])) await handler(event);
  }
}
