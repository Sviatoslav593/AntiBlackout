// localStorage utilities for order management

export interface PendingOrderData {
  orderId: string;
  customerData: {
    name: string;
    email: string;
    phone: string;
    city: string;
    branch: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const PENDING_ORDER_KEY = "pendingOrder";
const PENDING_ORDER_ID_KEY = "pendingOrderId";

export const localStorageUtils = {
  // Save pending order data
  savePendingOrder: (orderData: PendingOrderData): void => {
    try {
      localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(orderData));
      localStorage.setItem(PENDING_ORDER_ID_KEY, orderData.orderId);
      console.log("💾 Order data saved to localStorage:", orderData.orderId);
    } catch (error) {
      console.error("❌ Error saving to localStorage:", error);
    }
  },

  // Get pending order data
  getPendingOrder: (): PendingOrderData | null => {
    try {
      const orderData = localStorage.getItem(PENDING_ORDER_KEY);
      return orderData ? JSON.parse(orderData) : null;
    } catch (error) {
      console.error("❌ Error reading from localStorage:", error);
      return null;
    }
  },

  // Get pending order ID
  getPendingOrderId: (): string | null => {
    try {
      return localStorage.getItem(PENDING_ORDER_ID_KEY);
    } catch (error) {
      console.error("❌ Error reading order ID from localStorage:", error);
      return null;
    }
  },

  // Check if order ID matches pending order
  isPendingOrder: (orderId: string): boolean => {
    const pendingOrderId = localStorageUtils.getPendingOrderId();
    return pendingOrderId === orderId;
  },

  // Clear pending order data
  clearPendingOrder: (): void => {
    try {
      localStorage.removeItem(PENDING_ORDER_KEY);
      localStorage.removeItem(PENDING_ORDER_ID_KEY);
      console.log("🧹 Pending order data cleared from localStorage");
    } catch (error) {
      console.error("❌ Error clearing localStorage:", error);
    }
  },

  // Check if there's any pending order data
  hasPendingOrder: (): boolean => {
    return localStorageUtils.getPendingOrder() !== null;
  },

  // Get order data and clear it (one-time use)
  consumePendingOrder: (orderId: string): PendingOrderData | null => {
    if (!localStorageUtils.isPendingOrder(orderId)) {
      return null;
    }

    const orderData = localStorageUtils.getPendingOrder();
    if (orderData) {
      localStorageUtils.clearPendingOrder();
    }

    return orderData;
  },
};
