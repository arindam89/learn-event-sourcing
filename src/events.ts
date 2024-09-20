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