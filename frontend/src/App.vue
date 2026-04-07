<template>
  <div class="app-container">
    <header class="navbar">
      <div class="flex items-center justify-between">
        <div>
          <h1>🛡️ ForenseID</h1>
          <p>Sistema de Validación de Identidad</p>
        </div>
        <nav class="flex gap-4">
          <button
            @click="currentView = 'scanner'"
            :class="['nav-btn', currentView === 'scanner' && 'active']"
          >
            📸 Scanner
          </button>
          <button
            @click="currentView = 'playground'"
            :class="['nav-btn', currentView === 'playground' && 'active']"
          >
            🎮 API Playground
          </button>
        </nav>
      </div>
    </header>

    <main>
      <DocumentScanner v-if="currentView === 'scanner'" />
      <APIPlayground v-else-if="currentView === 'playground'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DocumentScanner from './components/DocumentScanner.vue';
import APIPlayground from './components/APIPlayground.vue';

const currentView = ref<string>('playground');
</script>

<style scoped>
.app-container {
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #f4f7f6;
  min-height: 100vh;
  color: #333;
}

.navbar {
  background-color: #1a1a2e;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.navbar h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 1px;
}

.navbar p {
  margin: 5px 0 0 0;
  color: #00ff88;
  font-size: 0.9rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-4 {
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-btn.active {
  background-color: #00ff88;
  color: #1a1a2e;
  border-color: #00ff88;
}

main {
  display: flex;
  justify-content: center;
}
</style>