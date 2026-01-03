<template>
  <div class="app-container">
    <aside class="sidebar">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="100" />
      <h2>Meine Wunschliste</h2>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #fff0f5; /* leichtes Rosa */
  font-family: Arial, sans-serif;
}

.sidebar {
  width: 180px; /* ⬅️ kleiner als vorher */
  background-color: white;
  padding: 2rem 1rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar .logo {
  margin-bottom: 1rem;
}

.sidebar h2 {
  font-size: 1rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: bold;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar nav a {
  text-decoration: none;
  color: #444;
  font-weight: 500;
  text-align: center;
}

.sidebar nav a.router-link-exact-active {
  color: #e75480; /* pink */
  font-weight: bold;
}

.content {
  flex: 1; /* ⬅️ nimmt jetzt den ganzen Restplatz ein */
  padding: 2rem;
}
</style>
