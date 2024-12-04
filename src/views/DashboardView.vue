<template>
    <div class="p-8 bg-[#f4f5f7]">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-[24px] font-semibold text-[#172B4D]">Dashboard</h1>
                <p class="text-[#5E6C84]">Resumen de actividades del día</p>
            </div>
            <div class="flex items-center gap-2 text-[#172B4D]">
                <Calendar class="h-5 w-5" />
                {{ currentDate }}
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg p-6 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-[#172B4D] font-medium">Ventas Entregadas</h3>
                    <DollarSign class="h-5 w-5 text-[#5E6C84]" />
                </div>
                <div class="text-[36px] font-semibold text-[#172B4D]">{{ orderStore.stats.delivered }}</div>
                <p class="text-[#5E6C84]">Total: S/ {{ orderStore.stats.totalAmount }}</p>
            </div>

            <div class="bg-white rounded-lg p-6 shadow-sm">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-[#172B4D] font-medium">Órdenes Pendientes</h3>
                    <Clock class="h-5 w-5 text-[#5E6C84]" />
                </div>
                <div class="text-[36px] font-semibold text-[#172B4D]">{{ orderStore.stats.pending }}</div>
                <p class="text-[#5E6C84]">Esperando ser procesadas</p>
            </div>
        </div>

        <!-- Orders Status Grid -->
        <div v-if="orderStore.state.loading" class="text-center py-8">
            <p class="text-lg text-gray-600">Cargando órdenes...</p>
        </div>
        <div v-else-if="orderStore.state.error" class="text-center py-8">
            <p class="text-lg text-red-600">Error: {{ orderStore.state.error.message }}</p>
        </div>
        <div v-else class="grid grid-cols-3 gap-6">
            <div v-for="status in orderStore.orderStatuses" :key="status.title" class="bg-[#f4f5f7]">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-[#172B4D] text-[16px] font-medium">{{ status.title }}</h3>
                    <span class="bg-[#DFE1E6] px-2 py-1 rounded-full text-[#172B4D] text-sm">
                        {{ status.orders.length }}
                    </span>
                </div>

                <div class="space-y-3">
                    <div v-for="order in status.orders" :key="order.id"
                        class="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        @click="openOrderModal(order)">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[#172B4D] font-medium">#{{ order.id }}</span>
                            <span :class="getStatusBadgeClass(orderStore.getLatestStatus(order))">
                                {{ getStatusLabel(orderStore.getLatestStatus(order)) }}
                            </span>
                        </div>

                        <div class="space-y-2">
                            <div class="flex items-center gap-2 text-[#5E6C84]">
                                <Calendar class="h-4 w-4" />
                                {{ formatDateToLimaTime(order.createdAt) }}
                            </div>
                            <div class="flex items-center gap-2 text-[#5E6C84]">
                                <User class="h-4 w-4" />
                                DNI: {{ order.dni }}
                            </div>
                            <div class="flex items-center gap-2 text-[#5E6C84]">
                                <Phone class="h-4 w-4" />
                                {{ order.cellphone }}
                            </div>
                            <div class="flex items-center gap-2 text-[#5E6C84]">
                                <CreditCard class="h-4 w-4" />
                                {{ getPaymentMethodLabel(order.paymentMethod) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Modal -->
        <OrderModal v-if="selectedOrder" :order="selectedOrder" @close="closeOrderModal"
            @update-status="updateOrderStatus" />
        <NotificationComponent />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    DollarSign,
    Clock,
    Calendar,
    User,
    Phone,
    CreditCard
} from 'lucide-vue-next'
import OrderModal from '../components/OrderModal.vue'
import NotificationComponent from '../components/NotificationComponent.vue'
import type { Order, OrderStatus } from '../types/order'
import { formatDateToLimaTime } from '../utils/dateUtils'
import { useOrderStore } from '@/stores/orderStore'

const orderStore = useOrderStore()

const selectedOrder = ref<Order | null>(null)

const currentDate = computed(() => {
    return format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })
})

const getStatusBadgeClass = (status: OrderStatus['status']): string => {
    const classes: Record<OrderStatus['status'], string> = {
        'PENDING': 'bg-[#FFAB00] bg-opacity-20 text-[#172B4D]',
        'ACCEPTED': 'bg-[#36B37E] bg-opacity-20 text-[#172B4D]',
        'DELIVERED': 'bg-[#00B8D9] bg-opacity-20 text-[#172B4D]',
        'CANCELLED': 'bg-[#FF5630] bg-opacity-20 text-[#172B4D]'
    }
    return `px-2 py-1 rounded-full text-sm ${classes[status]}`
}

const getStatusLabel = (status: OrderStatus['status']): string => {
    const labels: Record<OrderStatus['status'], string> = {
        'PENDING': 'Pendiente',
        'ACCEPTED': 'Aceptado',
        'DELIVERED': 'Entregado',
        'CANCELLED': 'Cancelado'
    }
    return labels[status]
}

const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
        'CASH': 'Efectivo',
        'YAPE': 'Yape',
        'PLIN': 'Plin'
    }
    return labels[method] || method
}

const openOrderModal = (order: Order): void => {
    selectedOrder.value = order
}

const closeOrderModal = (): void => {
    selectedOrder.value = null
}

const updateOrderStatus = async (orderId: number, newStatus: OrderStatus['status']): Promise<void> => {
    await orderStore.updateOrderStatus(orderId, newStatus)
    closeOrderModal()
}

onMounted(() => {
    orderStore.fetchOrders()
})
</script>
