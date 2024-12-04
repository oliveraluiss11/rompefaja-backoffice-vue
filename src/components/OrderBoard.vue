<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="status in orderStatuses" :key="status.value" class="bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-700">{{ status.label }}</h3>
                <span class="px-2 py-1 bg-white rounded-full text-sm text-gray-600">
                    {{ getOrdersByStatus(status.value).length }}
                </span>
            </div>
            <draggable :list="getOrdersByStatus(status.value)" group="orders" @change="onDragChange" item-key="id">
                <template #item="{ element }">
                    <OrderCard :order="element" @click="openOrderModal(element)" />
                </template>
            </draggable>
        </div>

        <OrderModal v-if="selectedOrder" :order="selectedOrder" @close="closeOrderModal"
            @update-status="updateOrderStatus" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import OrderCard from './OrderCard.vue'
import OrderModal from './OrderModal.vue'
import type { Order, OrderStatus } from '@/types/order'

const props = defineProps<{
    orders: Order[]
}>()

const emit = defineEmits<{
    (e: 'update-order', order: Order): void
}>()

const orderStatuses: { value: OrderStatus['status']; label: string }[] = [
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'ACCEPTED', label: 'Aceptadas' },
    { value: 'DELIVERED', label: 'Entregadas' },
]

const selectedOrder = ref<Order | null>(null)

const getLatestStatus = (order: Order): OrderStatus['status'] => {
    const lastStatus = order.statusHistory[order.statusHistory.length - 1]
    return lastStatus ? lastStatus.status : 'PENDING'
}

const getOrdersByStatus = (status: OrderStatus['status']) => {
    return props.orders.filter(order => getLatestStatus(order) === status)
}

const openOrderModal = (order: Order) => {
    selectedOrder.value = order
}

const closeOrderModal = () => {
    selectedOrder.value = null
}

const updateOrderStatus = (orderId: number, newStatus: OrderStatus['status']) => {
    const updatedOrder = props.orders.find(order => order.id === orderId)
    if (updatedOrder) {
        updatedOrder.statusHistory.push({
            status: newStatus,
            date: new Date()
        })
        emit('update-order', updatedOrder)
    }
    closeOrderModal()
}

const onDragChange = (event: { added?: { element: Order; newIndex: number } }) => {
    if (event.added) {
        const { element, newIndex } = event.added
        const newStatus = orderStatuses[Math.floor(newIndex / (props.orders.length / 3))].value
        updateOrderStatus(element.id, newStatus)
    }
}
</script>