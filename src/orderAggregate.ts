import { EventStore } from "./eventStore";
import { OrderPlacedEvent, ItemAddedEvent } from "./events";

interface OrderState {
  orderId: string;
  customerId: string;
  items: { itemId: string; quantity: number }[];
  createdAt: Date;
}

export class OrderAggregate {
  private state: OrderState | null = null;

  constructor(private eventStore: EventStore) {}

  // Create a new order
  placeOrder(orderId: string, customerId: string) {
    const orderPlacedEvent: OrderPlacedEvent = {
      type: "OrderPlaced",
      data: {
        orderId,
        customerId,
        createdAt: new Date(),
      },
    };
    this.eventStore.save(orderPlacedEvent);
  }

  // Add an item to the order
  addItem(orderId: string, itemId: string, quantity: number) {
    const itemAddedEvent: ItemAddedEvent = {
      type: "ItemAdded",
      data: {
        orderId,
        itemId,
        quantity,
      },
    };
    this.eventStore.save(itemAddedEvent);
  }

  // Rebuild the current state of the order by applying all events
  rebuildState(orderId: string) {
    const events = this.eventStore.getEventsForOrder(orderId);
    this.state = {
      orderId: "",
      customerId: "",
      items: [],
      createdAt: new Date(),
    };

    for (const event of events) {
      if (event.type === "OrderPlaced") {
        this.state.orderId = event.data.orderId;
        this.state.customerId = event.data.customerId;
        this.state.createdAt = event.data.createdAt;
      } else if (event.type === "ItemAdded") {
        this.state.items.push({
          itemId: event.data.itemId,
          quantity: event.data.quantity,
        });
      }
    }
  }

  // Get the current state of the order
  getState() {
    return this.state;
  }
}