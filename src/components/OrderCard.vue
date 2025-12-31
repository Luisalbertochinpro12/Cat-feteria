<template>
  <div class="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
    <div :class="[
      'p-3 text-white font-bold flex justify-between items-center',
      order.deliveryType === 'Para llevar' ? 'bg-orange-500' : 'bg-blue-500'
    ]">
      <span>#{{ order.id }} - {{ order.deliveryType }}</span>
    </div>
    <div class="p-4 space-y-2">
      <div v-for="item in order.items" :key="item.id" class="flex justify-between border-b border-dashed pb-1 text-sm">
        <span class="font-bold">{{ item.quantity }}x {{ item.name }}</span>
      </div>
    </div>
    <button @click="$emit('completed')" class="w-full bg-slate-800 text-white py-3 font-bold hover:bg-green-600 transition-colors">
      LISTO / ENTREGADO
    </button>
  </div>
</template>

<script setup>
defineProps(['order']);
defineEmits(['completed']);
</script>