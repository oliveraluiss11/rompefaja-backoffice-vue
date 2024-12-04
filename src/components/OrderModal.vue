<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 class="text-2xl font-bold text-gray-900">Orden #{{ order.id }}</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <X class="h-6 w-6" />
                </button>
            </div>
            <div class="flex-1 overflow-auto">
                <div class="p-6">
                    <div class="flex border-b border-gray-200">
                        <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value" :class="[
                            'px-4 py-2 font-medium text-sm focus:outline-none',
                            activeTab === tab.value
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        ]">
                            {{ tab.label }}
                        </button>
                    </div>
                    <div class="mt-6">
                        <!-- Customer Information -->
                        <div v-if="activeTab === 'customer'" class="space-y-6">
                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">DNI</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ order.dni }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Teléfono</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ order.cellphone }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Método de Pago</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ getPaymentMethodLabel(order.paymentMethod)
                                        }}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">Fecha de Pedido</label>
                                    <p class="mt-1 text-sm text-gray-900">{{ formatDateToLimaTime(order.createdAt) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Order Details -->
                        <div v-if="activeTab === 'order'" class="space-y-6">
                            <div class="bg-gray-50 rounded-lg p-4">
                                <div v-for="item in order.items" :key="item.productId"
                                    class="py-4 border-b border-gray-200 last:border-b-0">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <p class="font-medium text-gray-900">{{ item.productName }}</p>
                                            <p class="text-sm text-gray-500">Cantidad: {{ item.quantity }}</p>
                                        </div>
                                        <p class="font-medium text-gray-900">S/ {{ item.price.toFixed(2) }}</p>
                                    </div>
                                    <div class="mt-2 text-sm text-gray-600">
                                        <p><strong>Papas:</strong> {{ translateFries(item.customizations.fries) }}</p>
                                        <p><strong>Vegetales:</strong> {{
                                            formatCustomizations(item.customizations.vegetables) }}</p>
                                        <p><strong>Salsas:</strong> {{ formatCustomizations(item.customizations.sauces)
                                            }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                                <p class="text-lg font-bold text-gray-900">Total</p>
                                <p class="text-lg font-bold text-gray-900">S/ {{ order.total.toFixed(2) }}</p>
                            </div>
                        </div>

                        <!-- Status History -->
                        <div v-if="activeTab === 'history'" class="space-y-4">
                            <div v-for="(status, index) in order.statusHistory" :key="index"
                                class="flex items-center space-x-3">
                                <div :class="getStatusIconClass(status.status)" class="rounded-full p-2">
                                    <component :is="getStatusIcon(status.status)" class="h-5 w-5" />
                                </div>
                                <div>
                                    <p class="font-medium text-gray-900">{{ getStatusLabel(status.status) }}</p>
                                    <p class="text-sm text-gray-500">{{ formatDateToLimaTime(status.date) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED'"
                class="p-6 bg-gray-50 border-t border-gray-200">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Actualizar Estado</h3>
                <div class="flex gap-4">
                    <button v-for="status in availableStatuses" :key="status" @click="updateStatus(status)" :class="[
                        'px-4 py-2 rounded-md font-medium text-sm focus:outline-none',
                        getStatusButtonClass(status)
                    ]">
                        {{ getStatusLabel(status) }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Clock, CheckCircle, XCircle, TruckIcon } from 'lucide-vue-next'
import type { Order, OrderStatus } from '@/types/order'
import { formatDateToLimaTime } from '@/utils/dateUtils'

const props = defineProps<{
    order: Order
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'update-status', orderId: number, newStatus: OrderStatus['status']): void
}>()

const activeTab = ref<'customer' | 'order' | 'history'>('customer')

const tabs = [
    { label: 'Información del Cliente', value: 'customer' as const },
    { label: 'Detalles del Pedido', value: 'order' as const },
    { label: 'Historial de Estados', value: 'history' as const }
]

const currentStatus = computed((): OrderStatus['status'] => {
    const lastStatus = props.order.statusHistory[props.order.statusHistory.length - 1]
    return lastStatus ? lastStatus.status : 'PENDING'
})

const availableStatuses = computed((): OrderStatus['status'][] => {
    switch (currentStatus.value) {
        case 'PENDING':
            return ['ACCEPTED', 'CANCELLED']
        case 'ACCEPTED':
            return ['DELIVERED', 'CANCELLED']
        case 'DELIVERED':
        case 'CANCELLED':
            return []
        default:
            return []
    }
})

const getStatusButtonClass = (status: OrderStatus['status']): string => {
    const classes: Record<OrderStatus['status'], string> = {
        'PENDING': 'bg-yellow-500 hover:bg-yellow-600 text-white',
        'ACCEPTED': 'bg-green-500 hover:bg-green-600 text-white',
        'DELIVERED': 'bg-blue-500 hover:bg-blue-600 text-white',
        'CANCELLED': 'bg-red-500 hover:bg-red-600 text-white'
    }
    return classes[status]
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

const getStatusIcon = (status: OrderStatus['status']) => {
    const icons: Record<OrderStatus['status'], typeof Clock> = {
        'PENDING': Clock,
        'ACCEPTED': CheckCircle,
        'DELIVERED': TruckIcon,
        'CANCELLED': XCircle
    }
    return icons[status]
}

const getStatusIconClass = (status: OrderStatus['status']): string => {
    const classes: Record<OrderStatus['status'], string> = {
        'PENDING': 'bg-yellow-100 text-yellow-600',
        'ACCEPTED': 'bg-green-100 text-green-600',
        'DELIVERED': 'bg-blue-100 text-blue-600',
        'CANCELLED': 'bg-red-100 text-red-600'
    }
    return classes[status]
}

const updateStatus = (newStatus: OrderStatus['status']): void => {
    emit('update-status', props.order.id, newStatus)
}

const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
        'CASH': 'Efectivo',
        'YAPE': 'Yape',
        'PLIN': 'Plin'
    }
    return labels[method] || method
}

const translateFries = (fries: string): string => {
    const translations: Record<string, string> = {
        'FRENCH_FRIES': 'Papas fritas',
        'SHOESTRING_FRIES': 'Papas al hilo',
    }
    return translations[fries] || fries
}

const formatCustomizations = (customizations: Record<string, boolean>): string => {
    const translations: Record<string, string> = {
        'LETTUCE': 'Lechuga',
        'TOMATO': 'Tomate',
        'PICKLE': 'Pepinillos',
        'KETCHUP': 'Kétchup',
        'MUSTARD': 'Mostaza',
        'MAYONNAISE': 'Mayonesa',
        'TARTAR': 'Salsa tártara',
        'AJI': 'Ají',
        'OLIVE': 'Aceituna'
    }
    return Object.entries(customizations)
        .filter(([, value]) => value)
        .map(([key]) => translations[key] || key)
        .join(', ')
}
</script>