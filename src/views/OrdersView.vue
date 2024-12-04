<template>
    <div class="flex flex-col h-screen bg-gray-50">
        <div class="flex-grow overflow-hidden">
            <div class="h-full overflow-auto p-8">
                <div class="max-w-7xl mx-auto">
                    <div class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">Órdenes</h1>
                        <p class="text-lg text-gray-600">Gestiona y visualiza todas las órdenes</p>
                    </div>

                    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-semibold text-gray-700">Total de Ventas</h2>
                                <DollarSign class="h-8 w-8 text-green-500" />
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-gray-900">S/ {{ orderStore.stats.totalAmount }}</p>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-semibold text-gray-700">Total de Órdenes</h2>
                                <CalendarIcon class="h-8 w-8 text-blue-500" />
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-gray-900">{{ orderStore.state.orders.length }}</p>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-semibold text-gray-700">Órdenes Entregadas</h2>
                                <TruckIcon class="h-8 w-8 text-purple-500" />
                            </div>
                            <div>
                                <p class="text-3xl font-bold text-gray-900">{{ orderStore.stats.delivered }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            DNI</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teléfono</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Método de Pago</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado</th>
                                        <th scope="col"
                                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="order in orderStore.state.orders" :key="order.id"
                                        class="hover:bg-gray-50">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{
                                            order.id }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{
                                            formatDateToLimaTime(order.createdAt) }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.dni }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.cellphone
                                            }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{
                                            getPaymentMethodLabel(order.paymentMethod) }}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span :class="getStatusClass(orderStore.getLatestStatus(order))">
                                                {{ orderStore.getStatusLabel(orderStore.getLatestStatus(order)) }}
                                            </span>
                                        </td>
                                        <td
                                            class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                            S/ {{ order.total.toFixed(2) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { CalendarIcon, DollarSign, TruckIcon } from 'lucide-vue-next'
import { formatDateToLimaTime } from '../utils/dateUtils'
import { useOrderStore } from '@/stores/orderStore'
import type { OrderStatus } from '@/types/order'

const orderStore = useOrderStore()

const getStatusClass = (status: OrderStatus['status']): string => {
    switch (status) {
        case 'PENDING':
            return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800'
        case 'ACCEPTED':
            return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800'
        case 'DELIVERED':
            return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
        case 'CANCELLED':
            return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
        default:
            return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'
    }
}

const getPaymentMethodLabel = (method: string): string => {
    const labels: Record<string, string> = {
        'CASH': 'Efectivo',
        'YAPE': 'Yape',
        'PLIN': 'Plin'
    }
    return labels[method] || method
}

onMounted(async (): Promise<void> => {
    await orderStore.fetchOrders()
    console.log('Órdenes cargadas:', orderStore.state.orders.length)
})
</script>