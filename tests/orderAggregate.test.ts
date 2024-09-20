import { EventStore } from "../src/eventStore";
import { OrderAggregate } from "../src/orderAggregate";

describe("OrderAggregate", () => {
  let eventStore: EventStore;
  let orderAggregate: OrderAggregate;

  beforeEach(() => {
    eventStore = new EventStore();
    orderAggregate = new OrderAggregate(eventStore);
  });

  test("should place an order and add items", () => {
    const orderId = "order-123";
    orderAggregate.placeOrder(orderId, "customer-456");
    orderAggregate.addItem(orderId, "item-789", 2);
    orderAggregate.addItem(orderId, "item-101", 5);

    orderAggregate.rebuildState(orderId);
    const state = orderAggregate.getState();

    expect(state).toEqual({
      orderId: "order-123",
      customerId: "customer-456",
      items: [
        { itemId: "item-789", quantity: 2 },
        { itemId: "item-101", quantity: 5 },
      ],
      createdAt: expect.any(Date),
    });
  });
});