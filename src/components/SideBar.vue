<script setup>
defineProps(['currentView', 'lowStockCount']); // Recibimos el conteo de alertas
defineEmits(['change-view']);

const menuItems = [
  { id: 'sales', name: 'Punto de Venta', icon: '🛒' },
  { id: 'kitchen', name: 'Cocina', icon: '👨‍🍳' },
  { id: 'reports', name: 'Reportes', icon: '📊' },
  { id: 'inventory', name: 'Inventario', icon: '📦' }
];
</script>

<template>
  <nav class="w-20 lg:w-64 bg-slate-900 h-screen flex flex-col p-4 text-white shrink-0">
    <div class="mb-10 px-2 flex items-center gap-3">
      <span class="text-2xl">🐾</span>
      <h1 class="hidden lg:block font-black text-xl tracking-tighter uppercase">CAT-feteria</h1>
    </div>

    <div class="flex-1 w-full space-y-2">
      <button v-for="item in menuItems" :key="item.id" @click="$emit('change-view', item.id)"
        :class="[ 'w-full flex items-center justify-between p-3 rounded-xl font-bold transition-all', 
                  currentView === item.id ? 'bg-orange-600' : 'text-slate-400 hover:bg-slate-800' ]">
        <div class="flex items-center gap-4">
          <span>{{ item.icon }}</span>
          <span class="hidden lg:block">{{ item.name }}</span>
        </div>
        <span v-if="item.id === 'inventory' && lowStockCount > 0" 
              class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
          {{ lowStockCount }}
        </span>
      </button>
    </div>
  </nav>
</template>