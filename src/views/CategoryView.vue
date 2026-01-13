<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Deutsche Namen + Icons
const categoryMap: Record<string, { label: string; icon: string }> = {
  birthday:   { label: "Geburtstag",     icon: "🎂" },
  christmas:  { label: "Weihnachten",    icon: "🎄" },
  wedding:    { label: "Hochzeit",       icon: "💍" },
  baby:       { label: "Baby-Party",     icon: "👶" },
  wishlist:   { label: "Wunschliste",    icon: "🎁" },
  custom:     { label: "Eigene Kategorie", icon: "✨" }
}

const cat = categoryMap[route.params.id as string] || { label: route.params.id, icon: "📦" }

const lists = ref<{ id: number, title: string }[]>([])
const newList = ref('')

function addList() {
  if (!newList.value) return
  const id = Date.now()
  lists.value.push({ id, title: newList.value })
  newList.value = ''
}

function openList(id: number) {
  router.push(`/wishlist/${id}`)
}
</script>

<template>
  <div class="wrapper">

    <div class="header">
      <span class="icon">{{ cat.icon }}</span>
      <h2 class="headline">{{ cat.label }}</h2>
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
.wrapper {
  padding: 2rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
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
