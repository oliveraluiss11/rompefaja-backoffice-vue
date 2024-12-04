import type { Order, Customization, OrderStatus, OrderItem } from '@/types/order'
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

const convertFirestoreTimestampToDate = (timestamp: Timestamp | Date): Date => {
  return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp
}

const convertFirestoreDataToOrder = (doc: DocumentData): Order => {
  const data = doc.data() || {} // Provide an empty object if data is null
  return {
    id: doc.id,
    address: data.address || '',
    alternativeIngredients: data.alternativeIngredients || false,
    dni: data.dni || '',
    cellphone: data.cellphone || '',
    paymentMethod: data.paymentMethod || '',
    reference: data.reference || '',
    statusHistory: Array.isArray(data.statusHistory)
      ? data.statusHistory.map((status: OrderStatus) => ({
          status: status.status,
          date: convertFirestoreTimestampToDate(status.date),
        }))
      : [],
    items: Array.isArray(data.items)
      ? data.items.map((item: OrderItem) => ({
          productId: item.productId || '',
          productName: item.productName || '',
          price: item.price || 0,
          quantity: item.quantity || 0,
          customizations: (item.customizations as Customization) || {},
        }))
      : [],
    subtotal: data.subtotal || 0,
    shippingCost: data.shippingCost || 0,
    termsAccepted: data.termsAccepted || false,
    total: data.total || 0,
    createdAt: data.createdAt ? convertFirestoreTimestampToDate(data.createdAt) : new Date(),
  }
}

export const orderRepository = {
  async getOrders(): Promise<Order[]> {
    const ordersCol = collection(db, 'orders')
    const q = query(ordersCol, orderBy('createdAt', 'desc'))
    const orderSnapshot = await getDocs(q)
    return orderSnapshot.docs.map(convertFirestoreDataToOrder)
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus['status']): Promise<void> {
    const orderRef = doc(db, 'orders', orderId)
    await updateDoc(orderRef, {
      statusHistory: arrayUnion({
        status: newStatus,
        date: new Date(),
      }),
    })
  },
}
