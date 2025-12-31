<script setup>
import { ref, computed } from 'vue';
import { jsPDF } from "jspdf";
import ProductCard from '../components/ProductCard.vue';

const emit = defineEmits(['order-confirmed']);

// --- ESTADOS ---
const categories = ['Todas', 'Bebidas', 'Desayunos', 'Postres'];
const selectedCategory = ref('Todas');
const deliveryType = ref('Local');
const cart = ref({});
const discount = ref(0);

// Modal y Cobro Táctil
const showCheckout = ref(false);
const amountReceived = ref(0);
const customerName = ref('');
const paymentMethod = ref('Efectivo'); // 'Efectivo' o 'Tarjeta'

const miauFrases = [
  "¡Que tengas un miau-ravilloso día!",
  "Vuelve pronto por más caricias y café.",
  "Gracias por apoyar este miau-negocio.",
  "¡Ronroneos incluidos en tu compra!"
];

const menu = ref([
  { id: 1, name: 'Meow-chiato', price: 3.50, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400' },
  { id: 2, name: 'Cat-puccino', price: 4.50, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400' },
  { id: 3, name: 'Michi-Toast', price: 8.00, category: 'Desayunos', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400' },
  { id: 4, name: 'Muffin Miau', price: 2.50, category: 'Postres', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' },
  { id: 5, name: 'Hot Cakes Garrita', price: 6.50, category: 'Desayunos', image: 'https://images.unsplash.com/photo-1528452632455-1155806fe29a?w=400' }
]);

// --- LÓGICA ---
const cartItems = computed(() => Object.values(cart.value));
const subtotal = computed(() => cartItems.value.reduce((acc, i) => acc + (i.price * i.quantity), 0));
const total = computed(() => subtotal.value - (subtotal.value * (discount.value / 100)));
const filteredMenu = computed(() => {
  if (selectedCategory.value === 'Todas') return menu.value;
  return menu.value.filter(p => p.category === selectedCategory.value);
});

const handleUpdate = (prod) => {
  if (prod.quantity <= 0) delete cart.value[prod.id];
  else cart.value[prod.id] = { ...prod };
};

const updateAmount = (val) => {
  let current = amountReceived.value.toString();
  if (val === '.') {
    if (!current.includes('.')) amountReceived.value = current + '.';
  } else {
    if (amountReceived.value === 0) amountReceived.value = val;
    else amountReceived.value = parseFloat(current + val);
  }
};

const generateTicketPDF = (order) => {
  const doc = new jsPDF({ unit: "mm", format: [80, 160] });
  const frase = miauFrases[Math.floor(Math.random() * miauFrases.length)];

  doc.setFillColor(paymentMethod.value === 'Efectivo' ? 255 : 59, paymentMethod.value === 'Efectivo' ? 140 : 130, 0); 
  doc.rect(0, 0, 80, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(" CAT-FETERIA", 40, 12, { align: "center" });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`MÉTODO: ${order.paymentMethod.toUpperCase()}`, 40, 25, { align: "center" });
  doc.text("------------------------------------------", 40, 32, { align: "center" });

  doc.text(`CLIENTE: ${order.customer.toUpperCase()}`, 5, 40);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 5, 45);
  doc.text("------------------------------------------", 40, 50, { align: "center" });

  let y = 58;
  order.items.forEach(item => {
    doc.text(`${item.quantity}x ${item.name}`, 5, y);
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 75, y, { align: "right" });
    y += 5;
  });

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: $${order.total.toFixed(2)}`, 75, y, { align: "right" });
  
  y += 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(frase, 40, y, { align: "center" });
  
  doc.save(`Ticket_${order.customer}.pdf`);
};

const processSale = () => {
  const finalOrder = {
    customer: customerName.value || 'Cliente General',
    items: [...cartItems.value],
    total: total.value,
    deliveryType: deliveryType.value,
    paymentMethod: paymentMethod.value,
    received: paymentMethod.value === 'Tarjeta' ? total.value : amountReceived.value,
    change: paymentMethod.value === 'Tarjeta' ? 0 : amountReceived.value - total.value,
    date: new Date()
  };

  generateTicketPDF(finalOrder);
  emit('order-confirmed', finalOrder);

  showCheckout.value = false;
  cart.value = {};
  customerName.value = '';
  amountReceived.value = 0;
  discount.value = 0;
  paymentMethod.value = 'Efectivo';
};
</script>

<template>
  <div class="flex h-full overflow-hidden">
    <div class="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      <nav class="bg-white border-b p-4 flex gap-3 overflow-x-auto shrink-0">
        <button v-for="cat in categories" :key="cat" @click="selectedCategory = cat"
          :class="[selectedCategory === cat ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600']"
          class="px-6 py-2 rounded-xl font-bold transition-all">{{ cat }}</button>
      </nav>
      <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard v-for="item in filteredMenu" :key="item.id" :product="item" @update-order="handleUpdate" />
      </div>
    </div>

    <aside class="w-96 bg-white border-l flex flex-col shadow-2xl">
      <div class="p-4 bg-orange-50 border-b">
        <label class="text-[10px] font-black text-orange-800 uppercase">Michi-Cliente</label>
        <input v-model="customerName" placeholder="Nombre" class="w-full mt-1 bg-white border rounded-lg px-3 py-2 outline-none" />
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div v-if="cartItems.length === 0" class="text-center py-20 text-slate-300 italic">🐱 Esperando miau-orden...</div>
        <div v-for="item in cartItems" :key="item.id" class="flex justify-between border-b pb-2">
          <span class="font-bold text-sm">{{ item.quantity }}x {{ item.name }}</span>
          <span class="font-black text-sm">${{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>

      <div class="p-6 bg-slate-50 border-t">
        <div class="mb-4">
          <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">Descuento</p>
          <div class="flex gap-2">
            <button v-for="d in [0, 10, 15, 50]" :key="d" @click="discount = d"
              :class="discount === d ? 'bg-orange-600 text-white' : 'bg-white text-slate-600'"
              class="flex-1 py-1 rounded-lg text-xs font-bold border transition-all">{{ d }}%</button>
          </div>
        </div>
        <div class="flex justify-between items-end mb-4 px-1">
          <span class="text-xs font-bold text-slate-400 uppercase">Total</span>
          <span class="text-3xl font-black text-slate-900">${{ total.toFixed(2) }}</span>
        </div>
        <button @click="showCheckout = true" :disabled="cartItems.length === 0"
          class="w-full bg-orange-600 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-lg transition-all">
          COBRAR AHORA
        </button>
      </div>
    </aside>

    <div v-if="showCheckout" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-pop">
        <div class="p-6 text-center bg-slate-50 border-b">
          <p class="text-xs font-black text-slate-400 uppercase tracking-widest">Monto a Cobrar</p>
          <p class="text-5xl font-black text-orange-600">${{ total.toFixed(2) }}</p>
        </div>

        <div class="p-6">
          <div class="flex gap-3 mb-6">
            <button @click="paymentMethod = 'Efectivo'; amountReceived = 0" 
              :class="paymentMethod === 'Efectivo' ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'"
              class="flex-1 py-4 rounded-2xl font-bold transition-all text-sm">💵 EFECTIVO</button>
            <button @click="paymentMethod = 'Tarjeta'; amountReceived = total" 
              :class="paymentMethod === 'Tarjeta' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'"
              class="flex-1 py-4 rounded-2xl font-bold transition-all text-sm">💳 TARJETA</button>
          </div>

          <div v-if="paymentMethod === 'Efectivo'" class="grid grid-cols-12 gap-4">
            <div class="col-span-5 space-y-4">
              <div class="bg-slate-900 rounded-2xl p-4 text-white text-center">
                <p class="text-[10px] text-slate-400 font-bold">RECIBIDO</p>
                <p class="text-3xl font-mono">${{ amountReceived }}</p>
              </div>
              <div v-if="amountReceived >= total" class="bg-green-100 rounded-2xl p-4 text-center text-green-700">
                <p class="text-[10px] font-bold uppercase">Cambio</p>
                <p class="text-3xl font-black">${{ (amountReceived - total).toFixed(2) }}</p>
              </div>
            </div>

            <div class="col-span-7">
              <div class="grid grid-cols-3 gap-2 mb-3">
                <button v-for="cash in [20, 50, 100, 200]" :key="cash" @click="amountReceived = cash"
                  class="bg-blue-50 text-blue-700 font-bold py-2 rounded-xl border border-blue-100 text-xs">${{ cash }}</button>
                <button @click="amountReceived = total" class="bg-purple-50 text-purple-700 font-bold py-2 rounded-xl text-xs">Exacto</button>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="num in [1,2,3,4,5,6,7,8,9,0]" :key="num" @click="updateAmount(num)"
                  class="bg-slate-100 font-black py-4 rounded-xl active:bg-slate-300">{{ num }}</button>
                <button @click="amountReceived = 0" class="bg-red-50 text-red-500 font-black rounded-xl text-xs">BORRAR</button>
                <button @click="updateAmount('.')" class="bg-slate-100 font-black rounded-xl">.</button>
              </div>
            </div>
          </div>

          <div v-else class="py-10 text-center bg-blue-50 rounded-3xl border-2 border-dashed border-blue-200">
            <p class="text-blue-600 font-bold">💳 Inserte o deslice la tarjeta en la terminal</p>
            <p class="text-xs text-blue-400 mt-2">El pago por tarjeta se marca como exacto.</p>
          </div>
        </div>

        <div class="p-6 bg-slate-50 flex gap-4">
          <button @click="showCheckout = false" class="flex-1 py-4 font-bold text-slate-400">Cancelar</button>
          <button @click="processSale" :disabled="amountReceived < total"
            class="flex-[2] bg-green-600 text-white font-black text-lg py-4 rounded-2xl shadow-xl disabled:opacity-30">
            FINALIZAR VENTA 🐾
          </button>
        </div>
      </div>
    </div>
  </div>
</template>