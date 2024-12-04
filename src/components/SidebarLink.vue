<template>
    <RouterLink :to="item.href" :class="[
        isActive
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
    ]">
        <component :is="iconMap[item.icon]" :class="[
            isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
            'mr-3 flex-shrink-0 h-6 w-6'
        ]" aria-hidden="true" />
        {{ item.name }}
    </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { LayoutDashboard, ShoppingBag, Users, Settings } from 'lucide-vue-next'

const props = defineProps<{
    item: {
        name: string
        href: string
        icon: string
    }
}>()

const route = useRoute()

const isActive = computed(() => route.path === props.item.href)

const iconMap = {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Settings,
}
</script>