<script setup>
import { ref, onMounted, provide } from 'vue';
import { db } from './firebase'; // Usamos tus credenciales
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import SalesView from './views/SalesView.vue';
import ReportsView from './views/ReportsView.vue';
import InventoryView from './views/InventoryView.vue';

// --- ESTADOS ---
const currentView = ref('Ventas');
const allSales = ref([]);
const inventory = ref([]);

// --- CONEXIÓN PAAS (FIREBASE) ---
onMounted(() => {
  // 1. Cargar Ventas en tiempo real (ordenadas por fecha)
  const salesQuery = query(collection(db, "sales"), orderBy("date", "desc"));
  onSnapshot(salesQuery, (snapshot) => {
    allSales.value = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      total: Number(doc.data().total) 
    }));
  });

  // 2. Cargar Inventario en tiempo real
  onSnapshot(collection(db, "inventory"), (snapshot) => {
    inventory.value = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  });
});

// --- OPERACIÓN: GUARDAR VENTA EN LA NUBE ---
const handleOrderConfirmed = async (newOrderData) => {
  try {
    const finalOrder = {
      ...newOrderData,
      date: new Date().toISOString(), 
      timestamp: Date.now()
    };

    // Subida al servicio PaaS (Firebase)
    await addDoc(collection(db, "sales"), finalOrder);
    console.log("Venta sincronizada en la nube con éxito");
  } catch (error) {
    console.error("Error al subir a la nube:", error);
    alert("Error de conexión con el servicio PaaS");
  }
};

// Proveer datos a las vistas hijas
provide('inventory', inventory);
</script>

<template>
  <div class="h-screen flex flex-col font-sans text-slate-900 overflow-hidden bg-slate-100">
    
    <header class="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
      
      <div class="flex items-center gap-2">
        <span class="text-2xl md:text-3xl">🐾</span>
        <h1 class="font-black text-xl md:text-2xl tracking-tighter text-orange-600">
          CAT-FETERIA <span class="text-slate-300 font-light hidden sm:inline">POS</span>
        </h1>
      </div>
      
      <nav class="flex bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
        <button 
          v-for="view in ['Ventas', 'Inventario', 'Reportes']" 
          :key="view"
          @click="currentView = view"
          :class="[currentView === view ? 'bg-white shadow-sm text-orange-600' : 'text-slate-500 hover:text-slate-700']"
          class="flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl font-bold transition-all text-xs md:text-sm whitespace-nowrap"
        >
          {{ view }}
        </button>
      </nav>

      <div class="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-100">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-[9px] md:text-[10px] font-bold text-green-600 uppercase whitespace-nowrap">Cloud PaaS Active</span>
      </div>
    </header>

    <main class="flex-1 overflow-hidden relative">
      <transition name="fade">
        <div class="h-full w-full absolute inset-0">
          <SalesView 
            v-if="currentView === 'Ventas'" 
            :inventory="inventory"
            @order-confirmed="handleOrderConfirmed" 
          />
          <InventoryView 
            v-if="currentView === 'Inventario'" 
            :inventory="inventory"
          />
          <ReportsView 
            v-if="currentView === 'Reportes'" 
            :salesHistory="allSales" 
          />
        </div>
      </transition>
    </main>
  </div>
</template>

<style>
/* Estilos globales y reset */
body { 
  margin: 0; 
  padding: 0; 
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: contain; /* Evita el pull-to-refresh en móviles */
}

/* Scrollbars elegantes */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

/* Quitar scrollbar en el nav de móviles */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animación simple al cambiar de vista */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>