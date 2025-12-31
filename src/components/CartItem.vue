<script setup>
defineProps(['item'])
defineEmits(['increase', 'decrease'])
</script>

<template>
  <div class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
    <div class="flex flex-col">
      <span class="font-bold text-sm text-[#3e2723]">{{ item.name }}</span>
      <span class="text-xs text-gray-500">${{ item.price }} x {{ item.quantity }}</span>
    </div>
    <div class="flex items-center gap-2 bg-white rounded-lg border p-1">
      <button @click="$emit('decrease')" class="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-red-500 font-bold">-</button>
      <span class="w-4 text-center text-sm font-bold">{{ item.quantity }}</span>
      <button @click="$emit('increase')" class="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded text-green-500 font-bold">+</button>
    </div>
  </div>
</template>