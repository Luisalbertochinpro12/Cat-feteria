<template>
  <div class="p-8">
    <h2 class="text-2xl font-black mb-6 text-slate-800">Órdenes por Preparar</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <OrderCard 
        v-for="order in orders" 
        :key="order.id" 
        :order="order" 
        @completed="$emit('order-completed', order.id)"
      />
    </div>
  </div>
</template>

<script setup>
import OrderCard from '../components/OrderCard.vue';
defineProps(['orders']);
defineEmits(['order-completed']);
</script>