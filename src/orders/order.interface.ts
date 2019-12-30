interface Order {
  verifiedId: string;
  item: string;
  amount: number;
  totalPrice: number;
  payment: string;
  activity: boolean;
}

export default Order;
