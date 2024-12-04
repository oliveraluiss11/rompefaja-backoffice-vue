<template>
    <aside class="w-64 bg-[#FFFFFF] border-r border-[#DFE1E6]">
        <div class="p-6">
            <div class="flex items-center gap-2">
                <Scissors class="h-6 w-6 text-[#0052CC]" />
                <h1 class="text-xl font-semibold text-[#172B4D]">La Rompe Faja</h1>
            </div>
        </div>

        <nav class="mt-6">
            <router-link v-for="item in menuItems" :key="item.path" :to="item.path"
                class="flex items-center gap-3 px-6 py-3 text-[#172B4D] hover:bg-[#F4F5F7]"
                :class="{ 'bg-[#DEEBFF] text-[#0052CC]': currentPath === item.path }">
                <component :is="item.icon" class="h-5 w-5" />
                {{ item.name }}
            </router-link>
        </nav>
    </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
    LayoutGrid,
    ClipboardList,
    Users,
    Settings,
    Scissors
} from 'lucide-vue-next'

const route = useRoute()
const currentPath = computed(() => route.path)

const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutGrid },
    { name: 'Órdenes', path: '/orders', icon: ClipboardList },
    { name: 'Clientes', path: '/customers', icon: Users },
    { name: 'Configuración', path: '/settings', icon: Settings }
]
</script>