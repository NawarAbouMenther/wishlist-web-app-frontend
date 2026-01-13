<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

const router = useRouter()
const route = useRoute()

const API_URL = import.meta.env.VITE_API_URL

// Kategorie-Typ für saubere TS-Fixes
interface Category {
  id: number
  key: string
  label: string
}

const category = ref<Category | null>(null)

// Listen die vom Backend kommen
interface WishListEntry {
  id: number
  title: string
}

const lists = ref<WishListEntry[]>([])
const newList = ref("")

// Icons passend zum key
const icons: Record<string, string> = {
  birthday: "🎂",
  christmas: "🎄",
  wedding: "💍",
  baby: "👶",
  wishlist: "🎁",
  custom: "✨",
}

onMounted(async () => {
  loadCategory()
  loadLists()
})

async function loadCategory() {
  const res = await fetch(`${API_URL}/api/categories`)
  const all: Category[] = await res.json()

  const found = all.find((c: Category) => c.id == Number(route.params.id))
  category.value = found || null
}

async function loadLists() {
  const res = await fetch(`${API_URL}/api/categories/${route.params.id}/lists`)
  lists.value = await res.json()
}

async function addList() {
  if (!newList.value.trim()) return

  await fetch(`${API_URL}/api/categories/${route.params.id}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newList.value }),
  })

  newList.value = ""
  loadLists()
}

function openList(id: number) {
  router.push(`/wishlist/${id}`)
}
</script>

<template>
  <div class="wrapper">

    <div class="header" v-if="category">
      <span class="icon">{{ icons[category.key] }}</span>
      <h2 class="headline">{{ category.label }}</h2>
    </div>

    <div class="add">
      <input
        v-model="newList"
        placeholder="Neue Liste erstellen ..."
        class="big-input"
      />

      <button class="add-btn" @click="addList">+</button>
    </div>

    <div class="grid">
      <div
        v-for="list in lists"
        :key="list.id"
        class="card"
        @click="openList(list.id)"
      >
        <span class="card-icon">📄</span>
        <div class="card-text">{{ list.title }}</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* (Dein schönes Styling bleibt komplett unverändert) */
.wrapper {
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.icon {
  font-size: 3rem;
}

.headline {
  font-size: 2.3rem;
  font-weight: bold;
  color: #ed6bc4;
}

.add {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  align-items: center;
}

.big-input {
  flex: 1;
  padding: 1rem;
  font-size: 1.2rem;
  border: 2px solid #ffd7eb;
  border-radius: 0.9rem;
}

.add-btn {
  width: 55px;
  height: 55px;
  font-size: 2rem;
  background: #ff4fa8;
  color: white;
  border: none;
  border-radius: 0.9rem;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 6px 16px rgba(255, 79, 168, 0.35);
}

.add-btn:hover {
  transform: translateY(-3px) scale(1.05);
  background: #ff6ac4;
}

.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
}

.card {
  padding: 1.5rem;
  background: white;
  border-radius: 1.2rem;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  transition: 0.25s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 10px 28px rgba(255, 79, 168, 0.22);
  background: #ffe7f4;
}

.card-icon {
  font-size: 1.8rem;
}

.card-text {
  font-size: 1.1rem;
  font-weight: 600;
}
</style>
