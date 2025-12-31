<template>
  <div class="p-6 h-full flex flex-col">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-black text-slate-800">📦 Gestión de Inventario</h2>
        <p class="text-xs text-slate-500 font-bold uppercase tracking-wider">Cloud PaaS Active</p>
      </div>
      <button 
        @click="showModal = true"
        class="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-orange-200 hover:scale-105 transition-all active:scale-95"
      >
        + AÑADIR INSUMO
      </button>
    </div>

    <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex-1">
      <div class="overflow-y-auto h-full">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th class="p-5 font-bold text-slate-600 text-xs uppercase">Insumo</th>
              <th class="p-5 font-bold text-slate-600 text-xs uppercase">Categoría</th>
              <th class="p-5 font-bold text-slate-600 text-xs uppercase">Stock</th>
              <th class="p-5 font-bold text-slate-600 text-xs uppercase text-center">Estado</th>
              <th class="p-5 font-bold text-slate-600 text-xs uppercase text-right">Ajuste Rápido</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in inventory" :key="item.id" class="hover:bg-orange-50/30 transition-colors">
              <td class="p-5">
                <p class="font-bold text-slate-700">{{ item.name }}</p>
              </td>
              <td class="p-5">
                <span class="bg-slate-100 text-slate-600 text-[10px] px-3 py-1 rounded-lg font-black uppercase">
                  {{ item.type }}
                </span>
              </td>
              <td class="p-5">
                <span :class="['text-lg font-black', item.stock < 5 ? 'text-red-500' : 'text-slate-700']">
                  {{ item.stock }} <span class="text-xs font-normal text-slate-400">{{ item.unit }}</span>
                </span>
              </td>
              <td class="p-5 text-center">
                <span v-if="item.stock < 5" class="bg-red-100 text-red-600 text-[10px] px-3 py-1.5 rounded-full font-black uppercase animate-pulse">Crítico</span>
                <span v-else class="bg-green-100 text-green-600 text-[10px] px-3 py-1.5 rounded-full font-black uppercase">Óptimo</span>
              </td>
              <td class="p-5">
                <div class="flex justify-end gap-2">
                  <button @click="updateStock(item.id, -1)" class="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">-</button>
                  <button @click="updateStock(item.id, 1)" class="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl font-bold text-slate-400 hover:bg-green-50 hover:text-green-500 transition-all">+</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-pop">
        <div class="p-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-black text-slate-800">Nuevo Insumo</h3>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre del producto</label>
              <input v-model="newItem.name" type="text" placeholder="Ej. Leche Deslactosada" class="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 ring-orange-500/20 transition-all">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Categoría</label>
                <select v-model="newItem.type" class="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none appearance-none">
                  <option value="Granos">Granos</option>
                  <option value="Lácteos">Lácteos</option>
                  <option value="Repostería">Repostería</option>
                  <option value="Vegetales">Vegetales</option>
                  <option value="Desechables">Desechables</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Unidad</label>
                <input v-model="newItem.unit" type="text" placeholder="kg, L, pza" class="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none">
              </div>
            </div>

            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Cantidad Inicial</label>
              <input v-model.number="newItem.stock" type="number" class="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none text-2xl font-bold">
            </div>
          </div>

          <button 
            @click="saveNewItem"
            class="w-full mt-8 bg-orange-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all active:scale-95"
          >
            GUARDAR EN LA NUBE ☁️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, increment, addDoc } from "firebase/firestore";

const inventory = ref([]);
const showModal = ref(false);

const newItem = ref({
  name: '',
  type: 'Granos',
  stock: 0,
  unit: ''
});

onMounted(() => {
  onSnapshot(collection(db, "inventory"), (snapshot) => {
    inventory.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

const saveNewItem = async () => {
  if (!newItem.value.name) return alert("¡Miau! El nombre es obligatorio");
  try {
    await addDoc(collection(db, "inventory"), { ...newItem.value });
    newItem.value = { name: '', type: 'Granos', stock: 0, unit: '' };
    showModal.value = false;
  } catch (e) { console.error(e); }
};

const updateStock = async (id, cantidad) => {
  const itemRef = doc(db, "inventory", id);
  await updateDoc(itemRef, { stock: increment(cantidad) });
};
</script>

<style scoped>
.animate-pop { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes pop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>