<template>
  <div class="welcome-page">
    <div class="welcome-box">
      <span class="icon">🎁</span>

      <h1 class="title">Willkommen beim<br/>Wunschlisten-Creator</h1>

      <p class="subtitle">
        Erstelle deine persönliche Wunschliste — einfach und kostenlos.
      </p>

      <router-link to="/categories" class="btn">
        ➕ Neue Wunschliste erstellen
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 4rem;
}

.welcome-box {
  text-align: center;
}

.icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
}

.subtitle {
  color: #555;
  margin-bottom: 2rem;
}

.btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: #ed6bc4;
  color: white;
  font-size: 1.2rem;
  border-radius: 1rem;
  text-decoration: none;
  transition: 0.2s;
}

.btn:hover {
  transform: scale(1.05);
}
</style>
