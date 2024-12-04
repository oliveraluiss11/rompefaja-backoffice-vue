<template>
  <div class="flex h-screen bg-[#F4F5F7]">
    <SideBarComponent />
    <div class="flex flex-col flex-1 overflow-hidden">
      <TopBar />
      <main class="flex-1 overflow-x-hidden overflow-y-auto">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from './components/TopBar.vue'
import SideBarComponent from './components/SidebarComponent.vue';
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --ds-background-default: #FFFFFF;
  --ds-background-neutral: #F4F5F7;
  --ds-text: #172B4D;
  --ds-text-subtle: #5E6C84;
}

* {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}
</style>