<script setup lang="ts">
import { useRouter } from "vue-router"
const router = useRouter()

function goToCategories() {
  router.push("/categories")
}
</script>

<template>
  <div class="welcome-wrapper">

    <h1 class="title">Willkommen beim<br>Wunschlisten-Creator 🎀</h1>

    <p class="subtitle">
      Erstelle persönliche Wunschlisten für jede Kategorie.
    </p>

    <button class="start-btn" @click="goToCategories">
      ✨ Los geht's!
    </button>

  </div>
</template>

<style scoped>
.welcome-wrapper {
  text-align: center;
  padding-top: 160px;
}

.title {
  font-size: 3rem;
  font-weight: 900;
  color: #ed6bc4;
  text-shadow: 0 4px 20px rgba(255, 105, 180, 0.3);
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.3rem;
  color: #444;
  margin-bottom: 2.4rem;
}

.start-btn {
  background: #f162c4;
  color: white;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-size: 1.4rem;
  border: none;
  cursor: pointer;
  font-weight: 700;
  transition: 0.25s ease;
  box-shadow: 0 8px 20px rgba(255, 105, 180, 0.35);
}

.start-btn:hover {
  transform: translateY(-5px) scale(1.05);
  background: #ff6ac4;
  box-shadow: 0 12px 28px rgba(255, 105, 180, 0.45);
}
</style>
