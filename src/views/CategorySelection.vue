<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter()

// Kategorien mit Icon + Name
const categories = [
  { id: "birthday", label: "Geburtstag", icon: "🎂" },
  { id: "christmas", label: "Weihnachten", icon: "🎄" },
  { id: "wedding", label: "Hochzeit", icon: "💍" },
  { id: "baby", label: "Baby-Party", icon: "👶" },
  { id: "wishlist", label: "Wunschliste", icon: "🎁" },
  { id: "custom", label: "Eigene Kategorie", icon: "✨" }
]

function openCategory(id: string) {
  router.push(`/category/${id}`)
}
</script>

<template>
  <div class="wrapper">
    <h2 class="title">✨ Kategorie auswählen</h2>

    <div class="grid">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="card"
        @click="openCategory(cat.id)"
      >
        <div class="icon">{{ cat.icon }}</div>
        <div class="text">{{ cat.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  padding: 2rem;
  text-align: center;
}

.title {
  font-size: 2.4rem;
  color: #ed6bc4;
  font-weight: bold;
  margin-bottom: 2rem;
}

.grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  padding: 1rem;
}

.card {
  background: white;
  padding: 2.2rem 1rem;
  border-radius: 1.4rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: 0.25s;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 14px 35px rgba(255, 79, 168, 0.25);
  background: #ffe7f4;
}

.icon {
  font-size: 3.2rem;
  margin-bottom: 0.8rem;
}

.text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}
</style>
