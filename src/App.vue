<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="layout">
    <!-- Linke Sidebar -->
    <aside class="sidebar">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" />
      <h1 class="title">Meine Wunschliste</h1>
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
.layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Sidebar-Design */
.sidebar {
  width: 150px;
  background-color: white;
  padding: 2rem 1rem;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 80px;
  margin-bottom: 1rem;
}

.title {
  font-size: 1rem;
  text-align: center;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #333;
}

/* Navigation */
nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

nav a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
}

nav a.router-link-exact-active {
  color: #e91e63; /* Pink aktiv */
  font-weight: bold;
}

/* Hauptinhalt */
.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #fff8fb;
}
</style>
