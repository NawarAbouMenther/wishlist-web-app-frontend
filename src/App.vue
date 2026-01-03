<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="100" height="100" />

    <div class="wrapper">
      <h1>Meine Wunschliste</h1>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <main class="main-container">
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  padding: 2rem 1rem;
  text-align: center;
}

.logo {
  display: block;
  margin: 0 auto 1rem;
}

.wrapper {
  max-width: 1024px;
  margin: 0 auto;
}

h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

nav {
  margin-top: 1rem;
}

nav a {
  margin: 0 1rem;
  color: #555;
  text-decoration: none;
  font-weight: 500;
}

nav a.router-link-exact-active {
  color: #555555;
}

</style>
