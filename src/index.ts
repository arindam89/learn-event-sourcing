import { EventStore } from "./eventStore";
import { OrderAggregate } from "./orderAggregate";

// Initialize event store
const eventStore = new EventStore();

// Create an instance of the order aggregate
const orderAggregate = new OrderAggregate(eventStore);

// Simulate placing an order and adding items
const orderId = "order-123";
orderAggregate.placeOrder(orderId, "customer-456");
orderAggregate.addItem(orderId, "item-789", 2);
orderAggregate.addItem(orderId, "item-101", 5);

// Rebuild the state from events
orderAggregate.rebuildState(orderId);

// Get and display the current state of the order
const orderState = orderAggregate.getState();
console.log("Reconstructed order state:", orderState);