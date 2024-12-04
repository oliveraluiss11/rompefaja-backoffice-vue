import { ref, computed } from 'vue'
import { orderService } from '../services/orderService'
import type { Order, OrderStatus } from '../types/order'

export function useOrders() {
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchOrders = async () => {
    loading.value = true
    try {
      orders.value = await orderService.getOrders()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('An unknown error occurred')
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (orderId: number, newStatus: OrderStatus['status']) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus)
      await fetchOrders() // Refresh the orders after updating
    } catch (e) {
      error.value = e instanceof Error ? e : new Error('An unknown error occurred')
    }
  }

  const getLatestStatus = (order: Order): OrderStatus['status'] => {
    if (!order.statusHistory || order.statusHistory.length === 0) {
      return 'PENDING' // Default status if no history is available
    }
    const lastStatus = order.statusHistory[order.statusHistory.length - 1]
    return lastStatus?.status || 'PENDING'
  }

  const orderStatuses = computed(() => {
    const statuses = [
      { title: 'Pendientes', status: 'PENDING' as const },
      { title: 'Aceptadas', status: 'ACCEPTED' as const },
      { title: 'Entregadas', status: 'DELIVERED' as const },
    ]

    return statuses.map((s) => ({
      title: s.title,
      orders: orders.value.filter((order) => getLatestStatus(order) === s.status),
    }))
  })

  const stats = computed(() => ({
    delivered: orders.value.filter((order) => getLatestStatus(order) === 'DELIVERED').length,
    pending: orders.value.filter((order) => getLatestStatus(order) === 'PENDING').length,
    totalAmount: orders.value.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2),
  }))

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    orderStatuses,
    stats,
    getLatestStatus,
  }
}
