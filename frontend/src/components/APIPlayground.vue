<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">🛡️ ForenseID API Playground</h1>
      <p class="text-slate-400">Prueba todos los endpoints en tiempo real</p>
    </div>

    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sidebar - Endpoints -->
      <div class="lg:col-span-1">
        <div class="bg-slate-800 rounded-lg border border-slate-700 p-6 sticky top-8">
          <h2 class="text-xl font-bold text-white mb-4">📋 Endpoints</h2>
          
          <!-- API Key Config -->
          <div class="mb-6 pb-6 border-b border-slate-600">
            <label class="block text-sm font-medium text-slate-300 mb-2">API Key</label>
            <input
              v-model="apiKey"
              type="password"
              placeholder="forenseid_demo_key_2026"
              class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              @click="saveApiKey"
              class="mt-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
            >
              💾 Guardar
            </button>
          </div>

          <!-- Endpoints List -->
          <div class="space-y-2">
            <button
              v-for="endpoint in endpoints"
              :key="endpoint.id"
              @click="selectEndpoint(endpoint)"
              :class="[
                'w-full text-left px-3 py-2 rounded transition text-sm',
                selectedEndpoint?.id === endpoint.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700'
              ]"
            >
              <span class="font-mono text-xs" :style="{ color: methodColors[endpoint.method] }">
                {{ endpoint.method }}
              </span>
              <span class="ml-1">{{ endpoint.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-2">
        <div v-if="selectedEndpoint" class="space-y-6">
          <!-- Endpoint Details -->
          <div class="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div class="mb-4">
              <h2 class="text-2xl font-bold text-white mb-2">{{ selectedEndpoint.name }}</h2>
              <div class="flex gap-2 items-center">
                <span
                  class="px-3 py-1 rounded text-white text-sm font-mono"
                  :style="{ backgroundColor: methodColors[selectedEndpoint.method] }"
                >
                  {{ selectedEndpoint.method }}
                </span>
                <code class="text-slate-400 text-sm">{{ selectedEndpoint.path }}</code>
              </div>
            </div>
            
            <p class="text-slate-300 text-sm">{{ selectedEndpoint.description }}</p>

            <!-- Request Form -->
            <div class="mt-6 space-y-4">
              <!-- Query Parameters -->
              <div v-if="selectedEndpoint.queryParams?.length">
                <h3 class="text-sm font-semibold text-slate-200 mb-2">🔍 Query Parámetros</h3>
                <div class="space-y-2">
                  <div v-for="param in selectedEndpoint.queryParams" :key="param.name" class="flex gap-2">
                    <label class="flex-1">
                      <span class="block text-xs text-slate-400 mb-1">{{ param.name }}</span>
                      <input
                        v-model="queryParams[param.name]"
                        :type="param.type || 'text'"
                        :placeholder="param.placeholder"
                        class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <!-- Request Body -->
              <div v-if="selectedEndpoint.bodyExample">
                <h3 class="text-sm font-semibold text-slate-200 mb-2">📝 Body (JSON)</h3>
                <textarea
                  v-model="requestBody"
                  rows="8"
                  class="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm font-mono placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  :placeholder="JSON.stringify(selectedEndpoint.bodyExample, null, 2)"
                />
              </div>

              <!-- Send Button -->
              <button
                @click="sendRequest"
                :disabled="loading"
                class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded transition"
              >
                {{ loading ? '⏳ Enviando...' : '🚀 Enviar Request' }}
              </button>
            </div>
          </div>

          <!-- Response -->
          <div class="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 class="text-lg font-bold text-white mb-4">📤 Respuesta</h3>
            
            <div v-if="response" class="space-y-4">
              <div>
                <p class="text-sm text-slate-400 mb-1">Status Code</p>
                <p :class="[
                  'font-mono text-lg font-bold',
                  response.status >= 200 && response.status < 300 ? 'text-emerald-400' : 'text-red-400'
                ]">
                  {{ response.status }}
                </p>
              </div>
              
              <div>
                <p class="text-sm text-slate-400 mb-1">Response Body</p>
                <pre class="bg-slate-900 p-4 rounded border border-slate-600 text-slate-300 text-xs overflow-auto max-h-96">{{ JSON.stringify(response.data, null, 2) }}</pre>
              </div>

              <div v-if="response.time" class="text-xs text-slate-500">
                ⏱️ Tiempo: {{ response.time }}ms
              </div>
            </div>
            
            <div v-else class="text-slate-500 text-center py-8">
              Envía una request para ver la respuesta
            </div>

            <div v-if="error" class="mt-4 p-4 bg-red-900/20 border border-red-700 rounded">
              <p class="text-red-400 text-sm">❌ Error: {{ error }}</p>
            </div>
          </div>
        </div>

        <!-- No Endpoint Selected -->
        <div v-else class="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
          <p class="text-slate-400">Selecciona un endpoint para comenzar</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Endpoint {
  id: string;
  name: string;
  path: string;
  method: string;
  description: string;
  queryParams?: Array<{ name: string; type?: string; placeholder?: string }>;
  bodyExample?: any;
  requiresAuth?: boolean;
}

const API_BASE_URL = 'http://localhost:4000/api/v1';

const apiKey = ref('');
const selectedEndpoint = ref<Endpoint | null>(null);
const loading = ref(false);
const response = ref<any>(null);
const error = ref('');
const queryParams = ref<Record<string, any>>({});
const requestBody = ref('');

const methodColors: Record<string, string> = {
  GET: '#3b82f6',
  POST: '#10b981',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6'
};

const endpoints: Endpoint[] = [
  // Health
  {
    id: 'health',
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    description: 'Verificar estado del servidor',
    requiresAuth: false
  },

  // Resources
  {
    id: 'states',
    name: 'Estados Mexicanos',
    path: '/resources/states',
    method: 'GET',
    description: 'Obtener lista de estados mexicanos',
    requiresAuth: false
  },
  {
    id: 'document-types',
    name: 'Tipos de Documentos',
    path: '/resources/document-types',
    method: 'GET',
    description: 'Obtener tipos de documentos válidos',
    requiresAuth: false
  },
  {
    id: 'verdicts',
    name: 'Estados de Veredicto',
    path: '/resources/verdicts',
    method: 'GET',
    description: 'Obtener posibles estados de veredicto',
    requiresAuth: false
  },
  {
    id: 'error-codes',
    name: 'Códigos de Error',
    path: '/resources/error-codes',
    method: 'GET',
    description: 'Obtener referencias de códigos de error',
    queryParams: [
      { name: 'category', placeholder: 'authentication|validation|processing|database|resource|rate-limit' }
    ],
    requiresAuth: false
  },

  // Sessions
  {
    id: 'create-session',
    name: 'Crear Sesión',
    path: '/sessions',
    method: 'POST',
    description: 'Crear nueva sesión de verificación',
    bodyExample: { userId: 'user_123', durationMinutes: 30 },
    requiresAuth: true
  },
  {
    id: 'list-sessions',
    name: 'Listar Sesiones',
    path: '/sessions',
    method: 'GET',
    description: 'Obtener lista de sesiones con paginación',
    queryParams: [
      { name: 'page', type: 'number', placeholder: '1' },
      { name: 'limit', type: 'number', placeholder: '10' },
      { name: 'userId', placeholder: 'user_123' }
    ],
    requiresAuth: true
  },
  {
    id: 'get-session',
    name: 'Obtener Sesión',
    path: '/sessions/{id}',
    method: 'GET',
    description: 'Obtener detalles de una sesión específica',
    queryParams: [
      { name: 'id', placeholder: 'cmno6z6510001ttw71q5g3g0j' }
    ],
    requiresAuth: true
  },
  {
    id: 'update-session',
    name: 'Actualizar Sesión',
    path: '/sessions/{id}',
    method: 'PUT',
    description: 'Actualizar datos de una sesión',
    queryParams: [
      { name: 'id', placeholder: 'cmno6z6510001ttw71q5g3g0j' }
    ],
    bodyExample: { status: 'COMPLETED', result: 'VERDADERO', notes: 'Documento auténtico' },
    requiresAuth: true
  },
  {
    id: 'delete-session',
    name: 'Cancelar Sesión',
    path: '/sessions/{id}',
    method: 'DELETE',
    description: 'Cancelar una sesión de verificación',
    queryParams: [
      { name: 'id', placeholder: 'cmno6z6510001ttw71q5g3g0j' }
    ],
    requiresAuth: true
  },

  // Audits
  {
    id: 'list-audits',
    name: 'Historial de Auditorías',
    path: '/audits',
    method: 'GET',
    description: 'Obtener historial de análisis realizados',
    queryParams: [
      { name: 'page', type: 'number', placeholder: '1' },
      { name: 'limit', type: 'number', placeholder: '10' }
    ],
    requiresAuth: true
  }
];

function selectEndpoint(endpoint: Endpoint) {
  selectedEndpoint.value = endpoint;
  queryParams.value = {};
  requestBody.value = endpoint.bodyExample ? JSON.stringify(endpoint.bodyExample, null, 2) : '';
  response.value = null;
  error.value = '';
}

function saveApiKey() {
  localStorage.setItem('forenseid_api_key', apiKey.value);
  alert('✅ API Key guardada');
}

async function sendRequest() {
  if (!selectedEndpoint.value) return;

  loading.value = true;
  error.value = '';
  response.value = null;

  try {
    const endpoint = selectedEndpoint.value;
    let url = `${API_BASE_URL}${endpoint.path}`;

    // Replace path parameters
    for (const [key, value] of Object.entries(queryParams.value)) {
      if (endpoint.path.includes(`{${key}}`)) {
        url = url.replace(`{${key}}`, String(value));
      }
    }

    // Add query parameters
    const queryString = Object.entries(queryParams.value)
      .filter(([key]) => !endpoint.path.includes(`{${key}}`))
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    if (queryString) {
      url += '?' + queryString;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add API Key if required
    if (endpoint.requiresAuth && apiKey.value) {
      headers['Authorization'] = `Bearer ${apiKey.value}`;
    }

    const startTime = performance.now();

    let options: RequestInit = {
      method: endpoint.method,
      headers
    };

    if (endpoint.method !== 'GET' && endpoint.method !== 'DELETE' && requestBody.value) {
      try {
        options.body = requestBody.value;
      } catch (e) {
        throw new Error('Body JSON inválido');
      }
    }

    const res = await fetch(url, options);
    const data = await res.json();
    const endTime = performance.now();

    response.value = {
      status: res.status,
      data,
      time: Math.round(endTime - startTime)
    };
  } catch (err: any) {
    error.value = err.message || 'Error al realizar la request';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  const savedKey = localStorage.getItem('forenseid_api_key');
  if (savedKey) {
    apiKey.value = savedKey;
  }
});
</script>
