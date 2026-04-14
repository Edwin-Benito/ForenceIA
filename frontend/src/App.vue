<template>
  <div class="app-container">
    <header class="navbar">
      <div class="flex items-center justify-between">
        <div>
          <h1>🛡️ ForenseID</h1>
          <p>Sistema de Validación de Identidad</p>
        </div>
      </div>
    </header>

    <main>
      <DocumentScanner />
    </main>
  </div>
</template>

<script setup lang="ts">
import DocumentScanner from './components/DocumentScanner.vue';
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

main {
  display: flex;
  justify-content: center;
}
</style>