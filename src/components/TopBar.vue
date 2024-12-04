<template>
    <header class="bg-[#FFFFFF] border-b border-[#DFE1E6] h-16 flex items-center px-6">
        <h2 class="text-xl font-semibold text-[#172B4D]">{{ pageTitle }}</h2>
        <div class="ml-auto flex items-center gap-4">
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
import { Bell, HelpCircle, User } from 'lucide-vue-next'

const route = useRoute()
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
</script>