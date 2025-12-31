<script setup>
import { computed, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps(['salesHistory']);

const totalRevenue = computed(() => props.salesHistory.reduce((acc, sale) => acc + sale.total, 0));
const totalOrders = computed(() => props.salesHistory.length);
const avgTicket = computed(() => totalOrders.value ? totalRevenue.value / totalOrders.value : 0);

let categoryChart = null;
let paymentChart = null;

const initCharts = () => {
  const ctxCat = document.getElementById('categoryChart');
  const ctxPay = document.getElementById('paymentChart');

  if (categoryChart) categoryChart.destroy();
  if (paymentChart) paymentChart.destroy();

  // Datos Categorías
  const catData = {};
  props.salesHistory.forEach(sale => {
    sale.items.forEach(item => {
      catData[item.category] = (catData[item.category] || 0) + (item.price * item.quantity);
    });
  });

  categoryChart = new Chart(ctxCat, {
    type: 'bar',
    data: {
      labels: Object.keys(catData),
      datasets: [{
        label: 'Ventas por Categoría',
        data: Object.values(catData),
        backgroundColor: '#f97316',
        borderRadius: 10
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  // Datos Pago
  const payData = { 'Efectivo': 0, 'Tarjeta': 0 };
  props.salesHistory.forEach(sale => {
    payData[sale.paymentMethod || 'Efectivo'] += sale.total;
  });

  paymentChart = new Chart(ctxPay, {
    type: 'doughnut',
    data: {
      labels: Object.keys(payData),
      datasets: [{
        data: Object.values(payData),
        backgroundColor: ['#10b981', '#3b82f6']
      }]
    },
    options: { cutout: '70%' }
  });
};

onMounted(() => initCharts());
watch(() => props.salesHistory, () => initCharts(), { deep: true });
</script>

<template>
  <div class="h-full bg-slate-50 p-8 overflow-y-auto">
    <header class="mb-10">
      <h2 class="text-4xl font-black text-slate-900">Miau-Analytics 📈</h2>
      <p class="text-slate-500 font-medium">Estadísticas reales de tu Cat-fetería</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
      <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Venta Total</p>
        <p class="text-5xl font-black text-orange-600">${{ totalRevenue.toFixed(2) }}</p>
      </div>
      <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pedidos Hoy</p>
        <p class="text-5xl font-black text-slate-900">{{ totalOrders }}</p>
      </div>
      <div class="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ticket Promedio</p>
        <p class="text-5xl font-black text-blue-600">${{ avgTicket.toFixed(2) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-800 mb-8">Rendimiento por Categoría</h3>
        <canvas id="categoryChart"></canvas>
      </div>
      <div class="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-800 mb-8">Mix de Pagos (Cash vs Card)</h3>
        <div class="max-w-[320px] mx-auto">
          <canvas id="paymentChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>