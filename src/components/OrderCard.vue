<template>
    <div class="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        @click="$emit('click', order)">
        <div class="flex justify-between items-start mb-2">
            <span class="font-medium text-gray-900">#{{ order.id }}</span>
            <span :class="getStatusBadgeClass(latestStatus)">
                {{ latestStatus }}
            </span>
        </div>
        <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center space-x-2">
                <Calendar class="h-4 w-4" />
                <span>{{ formatDateToLimaTime(order.createdAt) }}</span>
            </div>
            <div class="flex items-center space-x-2">
                <User class="h-4 w-4" />
                <span>DNI: {{ order.dni }}</span>
            </div>
            <div class="flex items-center space-x-2">
                <Phone class="h-4 w-4" />
                <span>{{ order.cellphone }}</span>
            </div>
            <div class="flex items-center space-x-2">
                <CreditCard class="h-4 w-4" />
                <span>{{ order.paymentMethod }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, User, Phone, CreditCard } from 'lucide-vue-next'
import type { Order, OrderStatus } from '@/types/order'
import { formatDateToLimaTime } from '@/utils/dateUtils'

const props = defineProps<{
    order: Order
}>()

defineEmits<{
    (e: 'click', order: Order): void
}>()

const latestStatus = computed((): OrderStatus['status'] => {
    const lastStatus = props.order.statusHistory[props.order.statusHistory.length - 1]
    return lastStatus ? lastStatus.status : 'PENDING'
})

const getStatusBadgeClass = (status: OrderStatus['status']): string => {
    const classes = {
        'PENDING': 'bg-yellow-100 text-yellow-800',
        'ACCEPTED': 'bg-blue-100 text-blue-800',
        'DELIVERED': 'bg-green-100 text-green-800',
        'CANCELLED': 'bg-red-100 text-red-800'
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${classes[status] || ''}`
}
</script>