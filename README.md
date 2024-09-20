# learn-event-sourcing
Simple Type Script app showing the even sourcing

A simple example of implementing event sourcing in TypeScript using Node.js. This example will simulate an e-commerce order system where you can place orders and add items to the order, all captured as events.

### Setup

1. Create a folder for your project.
2. Initialize a Node.js project:  
   ```bash
   npm init -y
   ```
3. Install TypeScript and necessary dependencies:  
   ```bash
   npm install typescript ts-node @types/node
   ```
4. Create a `tsconfig.json` file:  
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "CommonJS",
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true
     }
   }
   ```

5. Create a `jest.config.js` file:
   ```javascript
   module.exports = {
     preset: 'ts-jest',
     testEnvironment: 'node',
     testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
   };
   ```

### Step 1: Define the Events

Create a folder `src/` and add the following files.

**src/events.ts**
```typescript
// Events representing actions in the system

export type Event =
  | OrderPlacedEvent
  | ItemAddedEvent;

export interface OrderPlacedEvent {
  type: "OrderPlaced";
  data: {
    orderId: string;
    customerId: string;
    createdAt: Date;
  };
}

export interface ItemAddedEvent {
  type: "ItemAdded";
  data: {
    orderId: string;
    itemId: string;
    quantity: number;
  };
}
```

### Step 2: Create an Event Store

**src/eventStore.ts**
```typescript
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
```

### Step 3: Define an Aggregate to Reconstruct State

**src/orderAggregate.ts**
```typescript
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
```

### Step 4: Run the System

**src/index.ts**
```typescript
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
```

### Step 5: Compile and Run

Run the following commands to compile and execute your TypeScript code:

```bash
npx ts-node src/index.ts
```

### Output

You should see an output similar to the following:

```bash
Event stored: {"type":"OrderPlaced","data":{"orderId":"order-123","customerId":"customer-456","createdAt":"2024-09-20T12:34:56.789Z"}}
Event stored: {"type":"ItemAdded","data":{"orderId":"order-123","itemId":"item-789","quantity":2}}
Event stored: {"type":"ItemAdded","data":{"orderId":"order-123","itemId":"item-101","quantity":5}}
Reconstructed order state: {
  orderId: 'order-123',
  customerId: 'customer-456',
  items: [
    { itemId: 'item-789', quantity: 2 },
    { itemId: 'item-101', quantity: 5 }
  ],
  createdAt: '2024-09-20T12:34:56.789Z'
}
```

### Running Unit Tests

To ensure that your implementation works correctly, you can write and run unit tests using Jest.

* Install Jest and its TypeScript support:
    ```bash
    npm install --save-dev jest ts-jest @types/jest
    ```

* Add a test script to your `package.json`:
    ```json
    "scripts": {
      "test": "jest"
    }
    ```

* Create a test file `src/orderAggregate.test.ts`:
    ```typescript
    import { EventStore } from "./eventStore";
    import { OrderAggregate } from "./orderAggregate";

    test("should place an order and add items", () => {
      const eventStore = new EventStore();
      const orderAggregate = new OrderAggregate(eventStore);

      const orderId = "order-123";
      orderAggregate.placeOrder(orderId, "customer-456");
      orderAggregate.addItem(orderId, "item-789", 2);
      orderAggregate.addItem(orderId, "item-101", 5);

      orderAggregate.rebuildState(orderId);
      const orderState = orderAggregate.getState();

      expect(orderState).toEqual({
         orderId: "order-123",
         customerId: "customer-456",
         items: [
            { itemId: "item-789", quantity: 2 },
            { itemId: "item-101", quantity: 5 },
         ],
         createdAt: expect.any(Date),
      });
    });
    ```

* Run the tests:
    ```bash
    npm test
    ```

You should see output indicating that your tests have passed.

### Summary
This code demonstrates how event sourcing works with a simple order system, where we:
- Capture events such as placing orders and adding items.
- Store these events in an event store.
- Rebuild the current state of an order by replaying events.

You can modify the system by adding more events or expanding its functionality!