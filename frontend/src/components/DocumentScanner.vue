<template>
  <div class="max-w-6xl mx-auto p-6 font-sans text-slate-900">
    <header class="mb-10 flex flex-col md:flex-row justify-between items-center border-b pb-8 gap-6">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-slate-800">🛡️ ForenseID</h1>
        <p class="text-slate-500 font-medium">Sistema de Integridad Documental y Peritaje</p>
      </div>

      <div class="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
        <button 
          @click="setTab('scanner')" 
          :class="activeTab === 'scanner' ? 'bg-white shadow-md text-slate-900 scale-105' : 'text-slate-500 hover:text-slate-700'"
          class="px-8 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2"
        >
          📄 Análisis
        </button>
        <button 
          @click="setTab('history')" 
          :class="activeTab === 'history' ? 'bg-white shadow-md text-slate-900 scale-105' : 'text-slate-500 hover:text-slate-700'"
          class="px-8 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2"
        >
          📂 Historial
        </button>
      </div>
    </header>

    <div v-if="activeTab === 'scanner'" class="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-500">
      
      <!-- SELECTOR DE MODO DE ANÁLISIS -->
      <div class="col-span-full">
        <div class="bg-gradient-to-r from-slate-100 to-slate-50 p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">⚙️ Selecciona modo de análisis:</p>
          <div class="flex flex-col lg:flex-row gap-3">
            <button 
              @click="analysisMode = 'unified'"
              :class="analysisMode === 'unified' ? 'ring-2 ring-slate-800 bg-slate-100 text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-50'"
              class="flex-1 p-4 rounded-xl border-2 border-slate-200 font-bold text-sm transition-all"
            >
              🧩 UNIFICADO GRATIS
              <div class="text-xs font-normal text-slate-500 mt-1">OCR + Face (y Cloud si está configurado)</div>
            </button>
            <button 
              @click="analysisMode = 'cloud'"
              :class="analysisMode === 'cloud' ? 'ring-2 ring-blue-500 bg-blue-50 text-blue-900' : 'bg-white text-slate-600 hover:bg-slate-50'"
              class="flex-1 p-4 rounded-xl border-2 border-blue-200 font-bold text-sm transition-all"
            >
              ☁️ Google Cloud (AI Avanzado)
              <div class="text-xs font-normal text-slate-500 mt-1">Solo datos reales (sin simulación)</div>
            </button>
          </div>
        </div>
      </div>
      
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          <h2 class="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
            <span class="bg-slate-800 text-white w-7 h-7 flex items-center justify-center rounded-lg text-xs">01</span> 
            Evidencia Digital
          </h2>

          <div class="flex gap-3 mb-6">
            <label class="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-center cursor-pointer hover:bg-slate-200 transition-all border border-slate-200">
              📁 Subir imagen
              <input type="file" accept="image/*" @change="handleFileUpload" class="hidden" />
            </label>
          </div>

          <div class="relative bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3] shadow-inner border-4 border-slate-200">
            <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-contain" />
            <div v-else class="absolute inset-0 flex items-center justify-center">
              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Selecciona una imagen para analizar</p>
            </div>
          </div>

          <div v-if="photoPreview" class="mt-6 flex gap-4">
            <button @click="clearFile" class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">🧹 Quitar</button>
            <button @click="sendToBackend" :disabled="isAnalyzing" class="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-black text-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100 uppercase tracking-wider">
              {{ isAnalyzing ? 'Analizando...' : 'Iniciar Auditoría' }}
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 min-h-[550px]">
        <h2 class="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
          <span class="bg-slate-800 text-white w-7 h-7 flex items-center justify-center rounded-lg text-xs">02</span> 
          Reporte Pericial
        </h2>

        <div v-if="isAnalyzing" class="flex flex-col items-center justify-center h-[400px]">
          <div class="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p class="font-black text-slate-400 uppercase tracking-widest text-xs animate-pulse">Consultando Red Neural...</p>
        </div>

        <div v-else-if="analysisResult" class="space-y-6">
          <div :class="analysisResult.forensicAnalysis.verdict.color === 'emerald'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
              : (analysisResult.forensicAnalysis.verdict.color === 'amber'
                ? 'bg-amber-50 border-amber-500 text-amber-900'
                : 'bg-red-50 border-red-500 text-red-900')" class="p-5 rounded-2xl border-l-8 shadow-sm flex items-start gap-4">
            <span class="text-4xl">{{ analysisResult.forensicAnalysis.verdict.status === 'VERDADERO' ? '🛡️' : (analysisResult.forensicAnalysis.verdict.status === 'SOSPECHOSO' ? '⚠️' : '🚫') }}</span>
            <div>
              <p class="font-black text-xl uppercase tracking-tight">Documento {{ analysisResult.forensicAnalysis.verdict.status }}</p>
              <p class="text-sm font-medium opacity-80">{{ analysisResult.forensicAnalysis.verdict.message }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Identidad Extraída</p>
              <div class="space-y-3">
                <div class="flex flex-col"><span class="text-[10px] font-bold text-slate-400 uppercase">Titular</span><span class="font-black text-slate-700 uppercase">{{ analysisResult.personalInfo.fullName }}</span></div>
                <div class="flex justify-between border-t border-slate-200 pt-2">
                  <div class="flex flex-col"><span class="text-[10px] font-bold text-slate-400 uppercase">ID / Pasaporte</span><span class="font-mono font-bold text-slate-600">{{ analysisResult.personalInfo.idNumber }}</span></div>
                  <div class="flex flex-col text-right"><span class="text-[10px] font-bold text-slate-400 uppercase">CURP / Tax ID</span><span class="font-mono font-bold text-slate-600">{{ analysisResult.personalInfo.curp }}</span></div>
                </div>
              </div>
            </div>

            <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Puntos de Control</p>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between items-center"><span class="font-bold text-slate-500">Biometría Facial</span><span :class="analysisResult.forensicAnalysis.faceDetected ? 'text-emerald-600' : 'text-red-600'" class="font-black uppercase italic">{{ analysisResult.forensicAnalysis.faceDetected ? 'Pasa' : 'Falla' }}</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-slate-500">Integridad Digital</span><span :class="!analysisResult.forensicAnalysis.isDigitallyAltered ? 'text-emerald-600' : 'text-red-600'" class="font-black uppercase italic">{{ !analysisResult.forensicAnalysis.isDigitallyAltered ? 'Limpio' : 'Manipulado' }}</span></div>
                <div class="flex justify-between items-center"><span class="font-bold text-slate-500">Origen de Documento</span><span :class="!analysisResult.forensicAnalysis.isSpecimen ? 'text-emerald-600' : 'text-red-600'" class="font-black uppercase italic">{{ !analysisResult.forensicAnalysis.isSpecimen ? 'Oficial' : 'Espécimen' }}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center h-[400px] text-slate-300">
          <p class="font-bold uppercase tracking-widest text-xs">Esperando Evidencia Forense</p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'history'" class="animate-in slide-in-from-right-4 duration-500">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div class="p-6 border-b bg-slate-50 flex justify-between items-center">
          <h2 class="font-black text-slate-700 uppercase tracking-tight">Registro General de Auditorías (SQLite)</h2>
          <button @click="fetchHistory" class="bg-white px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
            🔄 Refrescar DB
          </button>
        </div>

        <div v-if="isLoadingHistory" class="p-20 text-center text-slate-400">
          <div class="animate-spin inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full mb-4"></div>
          <p class="font-bold uppercase text-[10px]">Cargando historial...</p>
        </div>

        <div v-else-if="auditHistory.length > 0" class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th class="p-5">Timestamp</th>
                <th class="p-5">Titular Extraído</th>
                <th class="p-5">ID / Clave</th>
                <th class="p-5 text-center">Veredicto</th>
                <th class="p-5">Observaciones Periciales</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="audit in auditHistory" :key="audit.id" class="hover:bg-slate-50/50 transition-all group">
                <td class="p-5 text-xs font-mono text-slate-400">{{ new Date(audit.createdAt).toLocaleString() }}</td>
                <td class="p-5 font-black text-slate-700 uppercase text-xs">{{ audit.fullName }}</td>
                <td class="p-5 font-mono text-xs text-slate-500">{{ audit.documentId }}</td>
                <td class="p-5 text-center">
                  <span :class="audit.verdictStatus === 'VERDADERO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'" class="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">
                    {{ audit.verdictStatus }}
                  </span>
                </td>
                <td class="p-5 text-xs text-slate-500 italic">{{ audit.verdictMessage }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-20 text-center text-slate-300">
          <p class="text-4xl mb-4 opacity-30">📭</p>
          <p class="font-bold uppercase text-[10px]">No hay registros en la base de datos.</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref } from 'vue';
import axios from 'axios';

// ESTADOS GENERALES
const activeTab = ref('scanner');
const analysisMode = ref('unified'); // unified | cloud

// ESTADOS DEL ESCÁNER
const photoPreview = ref<string | null>(null);
const imageBlob = ref<Blob | null>(null);
const isAnalyzing = ref(false);
const analysisResult = ref<any>(null);

// ESTADOS DEL HISTORIAL
const auditHistory = ref([]);
const isLoadingHistory = ref(false);

// NAVEGACIÓN
const setTab = (tab) => {
  activeTab.value = tab;
  if (tab === 'history') fetchHistory();
};

// LÓGICA DE BASE DE DATOS
const fetchHistory = async () => {
  isLoadingHistory.value = true;
  try {
    const apiKey = localStorage.getItem('forenseid_api_key') || 'forenseid_demo_key_2026';
    const response = await axios.get('http://localhost:4000/api/v1/audits', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    auditHistory.value = response.data.data;
  } catch (error) {
    console.error("Error al consultar la DB:", error);
  } finally {
    isLoadingHistory.value = false;
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  imageBlob.value = file;
  photoPreview.value = URL.createObjectURL(file);
  analysisResult.value = null;
};

const clearFile = () => {
  photoPreview.value = null;
  imageBlob.value = null;
  analysisResult.value = null;
};

// COMUNICACIÓN CON BACKEND
const sendToBackend = async () => {
  if (!imageBlob.value) return;
  isAnalyzing.value = true;
  analysisResult.value = null;
  
  const formData = new FormData();
  formData.append('document', imageBlob.value, 'evidencia.jpg');

  try {
    const apiKey = localStorage.getItem('forenseid_api_key') || 'forenseid_demo_key_2026';
    
    // Seleccionar endpoint según modo
    let endpoint;
    if (analysisMode.value === 'unified') {
      endpoint = 'http://localhost:4000/api/v1/documents/analyze-unified';
    } else {
      endpoint = 'http://localhost:4000/api/v1/documents/analyze';
    }
    
    const response = await axios.post(endpoint, formData, {
      headers: {
        'X-API-Key': apiKey
      }
    });
    analysisResult.value = response.data.data;
    // Si el análisis fue exitoso, refrescamos el historial en segundo plano
    fetchHistory();
  } catch (error) {
    alert("Error forense: " + (error.response?.data?.message || "Servidor fuera de línea."));
  } finally {
    isAnalyzing.value = false;
  }
};
</script>

<style scoped>
/* Transiciones suaves para las pestañas */
.animate-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>