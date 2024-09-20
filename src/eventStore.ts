import { Event } from "./events";

export class EventStore {
  private events: Event[] = [];

  // Save an event to the event store
  save(event: Event) {
    this.events.push(event);
    console.log(`Event stored: ${JSON.stringify(event)}`);
  }

  // Retrieve all events for a specific order
  getEventsForOrder(orderId: string): Event[] {
    return this.events.filter(event => {
      if ("orderId" in event.data) {
        return event.data.orderId === orderId;
      }
      return false;
    });
  }
}