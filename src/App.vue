<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="100" height="100" />
      <h1>Meine Wunschliste</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </aside>

    <!-- Hauptinhalt -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* Layout: Sidebar + Content */
.layout {
  display: flex;
  height: 100vh;
  background-color: #fff0f5; /* Heller Hintergrund */
  font-family: 'Segoe UI', sans-serif;
}

/* SIDEBAR */
.sidebar {
  flex: 0 0 180px;
  padding: 1.5rem 1rem;
  background-color: #ffffff;
  border-right: 1px solid #eee;
  text-align: center;
}

.logo {
  margin-bottom: 1rem;
}

.sidebar h1 {
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: bold;
  color: #333;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.sidebar nav a {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
}

.sidebar nav a.router-link-exact-active {
  font-weight: bold;
  color: #ff69b4; /* Pink */
}

.sidebar nav a:hover {
  color: #d63384;
}

/* CONTENT */
.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

/* Prioritäten-Farben (z. B. für Dropdown) */
select option[value="hoch"] {
  background-color: #ffb3c6;
}

select option[value="mittel"] {
  background-color: #ffc2d1;
}

select option[value="niedrig"] {
  background-color: #ffe5ec;
}

/* Optional: Einheitliches Button-Styling */
button {
  border-radius: 5px;
  padding: 0.4rem 0.8rem;
  border: none;
  background-color: #ffb3c6;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #ffa1b9;
}
</style>
