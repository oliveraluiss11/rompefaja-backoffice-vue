import { orderRepository } from '../repositories/orderRepository'
import type { Order, OrderStatus } from '../types/order'

export const orderService = {
  async getOrders(): Promise<Order[]> {
    return await orderRepository.getOrders()
  },

  async updateOrderStatus(orderId: number, newStatus: OrderStatus['status']): Promise<void> {
    const validStatuses: OrderStatus['status'][] = ['PENDING', 'ACCEPTED', 'DELIVERED', 'CANCELLED']
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Estado no válido')
    }
    await orderRepository.updateOrderStatus(orderId.toString(), newStatus)
  },
}
