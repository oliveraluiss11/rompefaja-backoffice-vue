<template>
    <div class="fixed top-4 right-4 z-50">
        <TransitionGroup name="notification">
            <div v-for="notification in orderStore.state.notifications" :key="notification.id" :class="[
                'mb-2 p-4 rounded-md shadow-md max-w-md',
                notificationTypeClass(notification.type)
            ]">
                <div class="flex items-center justify-between">
                    <span>{{ notification.message }}</span>
                    <button @click="orderStore.removeNotification(notification.id)"
                        class="ml-4 text-sm font-medium text-gray-400 hover:text-gray-500">
                        <XIcon class="h-5 w-5" />
                    </button>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { XIcon } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'

const orderStore = useOrderStore()

const notificationTypeClass = (type: 'info' | 'success' | 'warning' | 'error'): string => {
    switch (type) {
        case 'info':
            return 'bg-blue-100 text-blue-800'
        case 'success':
            return 'bg-green-100 text-green-800'
        case 'warning':
            return 'bg-yellow-100 text-yellow-800'
        case 'error':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>