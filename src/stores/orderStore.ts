import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  getDocs,
  where,
  type DocumentData,
} from 'firebase/firestore'
import type { Customization, Order, OrderItem, OrderStatus } from '@/types/order'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { orderService } from '@/services/orderService'
import { db } from '@/repositories/firebaseConfig'
const notificationSound = new Audio('/notification-rompefaja.mp3')
interface OrderState {
  orders: Order[]
  loading: boolean
  error: Error | null
  dateRange: [Date | null, Date | null]
  notifications: Notification[]
  lastProcessedOrderIds: Set<number>
  soundEnabled: boolean
}

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
}

export const useOrderStore = defineStore('order', () => {
  const state = ref<OrderState>({
    orders: [],
    loading: false,
    error: null,
    dateRange: [null, null],
    notifications: [],
    lastProcessedOrderIds: new Set(),
    soundEnabled: false,
  })

  const filteredOrders = computed(() => {
    if (!state.value.dateRange[0] || !state.value.dateRange[1]) return state.value.orders

    return state.value.orders.filter((order: Order) => {
      const orderDate = new Date(order.createdAt)
      return isWithinInterval(orderDate, {
        start: startOfDay(state.value.dateRange[0]!),
        end: endOfDay(state.value.dateRange[1]!),
      })
    })
  })

  const orderStatuses = computed(() => {
    const statuses = [
      { title: 'Pendientes', status: 'PENDING' as const },
      { title: 'Aceptadas', status: 'ACCEPTED' as const },
      { title: 'Entregadas', status: 'DELIVERED' as const },
    ]

    return statuses.map((s) => ({
      ...s,
      title: getStatusLabel(s.status),
      orders: filteredOrders.value.filter((order: Order) => getLatestStatus(order) === s.status),
    }))
  })

  const stats = computed(() => {
    const deliveredOrders = filteredOrders.value.filter(
      (order: Order) => getLatestStatus(order) === 'DELIVERED',
    )
    return {
      delivered: deliveredOrders.length,
      pending: filteredOrders.value.filter((order: Order) => getLatestStatus(order) === 'PENDING')
        .length,
      totalAmount: deliveredOrders
        .reduce((sum: number, order: Order) => sum + (order.total || 0), 0)
        .toFixed(2),
    }
  })

  function getLatestStatus(order: Order): OrderStatus['status'] {
    if (!order.statusHistory || order.statusHistory.length === 0) {
      return 'PENDING'
    }
    const lastStatus = order.statusHistory[order.statusHistory.length - 1]
    return lastStatus?.status || 'PENDING'
  }

  function setDateRange(range: [Date | null, Date | null]): void {
    state.value.dateRange = range
  }

  function addNotification(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ): void {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    }
    state.value.notifications.push(notification)
    if (state.value.soundEnabled) {
      notificationSound
        .play()
        .catch((error) => console.error('Error playing notification sound:', error))
    }
    setTimeout(() => removeNotification(notification.id), 5000)
  }

  function removeNotification(id: string): void {
    state.value.notifications = state.value.notifications.filter((n) => n.id !== id)
  }

  function toggleSound(): void {
    state.value.soundEnabled = !state.value.soundEnabled
  }

  async function fetchOrders(): Promise<void> {
    state.value.loading = true
    try {
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(ordersQuery)

      state.value.orders = snapshot.docs.map((doc) => convertFirestoreDataToOrder(doc))
      state.value.loading = false
    } catch (e) {
      console.error('Error fetching orders:', e)
      state.value.error = e as Error
      state.value.loading = false
      addNotification('Error al cargar las órdenes', 'error')
    }
  }

  function listenForNewOrders(): void {
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      where('createdAt', '>', new Date()),
    )

    onSnapshot(
      ordersQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newOrder = convertFirestoreDataToOrder(change.doc)

            // Verificar si ya hemos procesado esta orden recientemente
            if (state.value.lastProcessedOrderIds.has(newOrder.id)) {
              return
            }

            // Añadir el ID de la orden al conjunto de órdenes procesadas
            state.value.lastProcessedOrderIds.add(newOrder.id)

            // Limpiar el conjunto después de un breve periodo para permitir futuros cambios
            setTimeout(() => {
              state.value.lastProcessedOrderIds.delete(newOrder.id)
            }, 5000)

            state.value.orders.unshift(newOrder)
            addNotification(`Nueva orden recibida: #${newOrder.id}`, 'success')
          }
        })
      },
      (error) => {
        console.error('Error listening for new orders:', error)
        addNotification('Error al escuchar nuevas órdenes', 'error')
      },
    )
  }

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

  async function updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus['status'],
  ): Promise<void> {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      // Actualizamos el estado localmente
      const orderIndex = state.value.orders.findIndex((order) => order.id === orderId)
      if (orderIndex !== -1) {
        state.value.orders[orderIndex].statusHistory.push({
          status: newStatus,
          date: new Date(),
        })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      addNotification(`Error al actualizar la orden #${orderId}`, 'error')
      throw error
    }
  }

  function getStatusLabel(status: OrderStatus['status']): string {
    const labels: Record<OrderStatus['status'], string> = {
      PENDING: 'Pendiente',
      ACCEPTED: 'Aceptado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    }
    return labels[status] || status
  }

  // Iniciar el listener cuando se crea el store
  listenForNewOrders()

  return {
    state,
    filteredOrders,
    orderStatuses,
    stats,
    getLatestStatus,
    setDateRange,
    fetchOrders,
    updateOrderStatus,
    addNotification,
    removeNotification,
    getStatusLabel,
    toggleSound,
  }
})
