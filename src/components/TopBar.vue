<template>
    <header class="bg-[#FFFFFF] border-b border-[#DFE1E6] h-16 flex items-center px-6">
        <h2 class="text-xl font-semibold text-[#172B4D]">{{ pageTitle }}</h2>
        <div class="ml-auto flex items-center gap-4">
            <button @click="toggleSound" class="text-[#5E6C84] hover:text-[#172B4D]">
                <Volume2 v-if="orderStore.state.soundEnabled" class="h-5 w-5" />
                <VolumeX v-else class="h-5 w-5" />
            </button>
            <button class="text-[#5E6C84] hover:text-[#172B4D]">
                <Bell class="h-5 w-5" />
            </button>
            <button class="text-[#5E6C84] hover:text-[#172B4D]">
                <HelpCircle class="h-5 w-5" />
            </button>
            <button class="text-[#5E6C84] hover:text-[#172B4D]">
                <User class="h-5 w-5" />
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, HelpCircle, User, Volume2, VolumeX } from 'lucide-vue-next'
import { useOrderStore } from '@/stores/orderStore'

const route = useRoute()
const orderStore = useOrderStore()

const pageTitle = computed(() => {
    switch (route.path) {
        case '/':
            return 'Dashboard'
        case '/orders':
            return 'Órdenes'
        case '/customers':
            return 'Clientes'
        case '/settings':
            return 'Configuración'
        default:
            return 'La Rompe Faja'
    }
})

const toggleSound = () => {
    orderStore.toggleSound()
    if (orderStore.state.soundEnabled) {
        const audio = new Audio('/notification-rompefaja.mp3')
        audio.volume = 0.1
        audio.play().catch(error => console.error('Error playing test sound:', error))
    }
}
</script>
