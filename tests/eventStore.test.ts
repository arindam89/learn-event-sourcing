import { EventStore } from "../src/eventStore";
import { OrderPlacedEvent, ItemAddedEvent } from "../src/events";

describe("EventStore", () => {
  let eventStore: EventStore;

  beforeEach(() => {
    eventStore = new EventStore();
  });

  test("should save and retrieve events", () => {
    const orderPlacedEvent: OrderPlacedEvent = {
      type: "OrderPlaced",
      data: {
        orderId: "order-123",
        customerId: "customer-456",
        createdAt: new Date(),
      },
    };

    const itemAddedEvent: ItemAddedEvent = {
      type: "ItemAdded",
      data: {
        orderId: "order-123",
        itemId: "item-789",
        quantity: 2,
      },
    };

    eventStore.save(orderPlacedEvent);
    eventStore.save(itemAddedEvent);

    const events = eventStore.getEventsForOrder("order-123");
    expect(events).toEqual([orderPlacedEvent, itemAddedEvent]);
  });
});