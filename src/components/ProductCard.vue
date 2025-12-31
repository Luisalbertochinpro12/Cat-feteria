<template>
  <div class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 border border-slate-100 flex flex-col items-center">
    <img :src="product.image" :alt="product.name" class="w-full h-32 object-cover rounded-xl mb-4" />
    
    <h3 class="text-lg font-bold text-slate-800">{{ product.name }}</h3>
    <p class="text-orange-600 font-semibold mb-4">${{ product.price.toFixed(2) }}</p>
    
    <div class="flex items-center space-x-4 bg-slate-50 rounded-full p-1">
      <button 
        @click="decrement" 
        :disabled="quantity === 0"
        class="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-600 hover:bg-orange-50 disabled:opacity-50 transition-colors"
      >
        <span class="text-xl font-bold">−</span>
      </button>
      
      <span class="w-8 text-center font-bold text-slate-700 text-lg">{{ quantity }}</span>
      
      <button 
        @click="increment" 
        class="w-10 h-10 flex items-center justify-center bg-orange-500 rounded-full shadow-sm text-white hover:bg-orange-600 transition-colors"
      >
        <span class="text-xl font-bold">+</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['product']);
const emit = defineEmits(['update-order']);

const quantity = ref(0);

const increment = () => quantity.value++;
const decrement = () => { if (quantity.value > 0) quantity.value--; };

watch(quantity, (newVal) => {
  emit('update-order', { ...props.product, quantity: newVal });
});
</script>