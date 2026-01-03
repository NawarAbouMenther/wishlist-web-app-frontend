<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface WishEntry {
  id?: number
  title: string
  name: string
  description: string
  status: string
  price: number
  fulfilled?: boolean
  priority: string
}

const wishes = ref<WishEntry[]>([])
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const newWish = ref<WishEntry>({
  title: '',
  name: '',
  description: '',
  status: '',
  price: 0,
  fulfilled: false,
  priority: 'mittel'
})

const editingWish = ref<WishEntry | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const filterStatus = ref<'all' | 'fulfilled' | 'open'>('all')
const filterPriority = ref<'all' | 'hoch' | 'mittel' | 'niedrig'>('all')

onMounted(loadWishes)

async function loadWishes() {
  const response = await fetch(`${API_URL}/api/wishes`)
  wishes.value = await response.json()
}

async function addWish() {
  await fetch(`${API_URL}/api/wishes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newWish.value)
  })

  await loadWishes()
  newWish.value = {
    title: '',
    name: '',
    description: '',
    status: '',
    price: 0,
    fulfilled: false,
    priority: 'mittel'
  }
}

async function deleteWish(id: number) {
  await fetch(`${API_URL}/api/wishes/${id}`, { method: 'DELETE' })
  await loadWishes()
}

function editWish(wish: WishEntry) {
  editingWish.value = { ...wish }
}

async function updateWish() {
  if (!editingWish.value?.id) return

  await fetch(`${API_URL}/api/wishes/${editingWish.value.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(editingWish.value)
  })

  editingWish.value = null
  await loadWishes()
}

function cancelEdit() {
  editingWish.value = null
}

async function markAsFulfilled(wish: WishEntry) {
  await fetch(`${API_URL}/api/wishes/${wish.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...wish, fulfilled: true })
  })

  await loadWishes()
}

const filteredAndSortedWishes = computed(() => {
  let result = [...wishes.value]

  if (filterStatus.value === 'fulfilled') result = result.filter(w => w.fulfilled)
  if (filterStatus.value === 'open') result = result.filter(w => !w.fulfilled)
  if (filterPriority.value !== 'all') result = result.filter(w => w.priority === filterPriority.value)

  result.sort((a, b) =>
    sortOrder.value === 'asc' ? a.price - b.price : b.price - a.price
  )

  return result
})

const totalPrice = computed(() =>
  filteredAndSortedWishes.value.reduce((sum, wish) => sum + wish.price, 0)
)
</script>

<template>
  <div class="container">
    <h2 class="title">🎁 Neuen Wunsch hinzufügen</h2>

    <form @submit.prevent="addWish" class="wish-form">
      <input v-model="newWish.title" placeholder="Titel" required />
      <input v-model="newWish.name" placeholder="Name" required />
      <input v-model="newWish.description" placeholder="Beschreibung" required />
      <input v-model="newWish.status" placeholder="Status" required />
      <input v-model.number="newWish.price" type="number" placeholder="Preis (€)" required />

      <select v-model="newWish.priority">
        <option value="hoch">Hoch</option>
        <option value="mittel">Mittel</option>
        <option value="niedrig">Niedrig</option>
      </select>

      <button type="submit">➕ Hinzufügen</button>
    </form>

    <h2 class="title">📋 Meine Wunschliste</h2>

    <div class="controls">
      <div>
        Sortieren:
        <button @click="sortOrder = 'asc'">🔼</button>
        <button @click="sortOrder = 'desc'">🔽</button>
      </div>

      <div>
        Status:
        <button @click="filterStatus = 'all'">Alle</button>
        <button @click="filterStatus = 'open'">Offen</button>
        <button @click="filterStatus = 'fulfilled'">Erfüllt</button>

        Priorität:
        <select v-model="filterPriority">
          <option value="all">Alle</option>
          <option value="hoch">Hoch</option>
          <option value="mittel">Mittel</option>
          <option value="niedrig">Niedrig</option>
        </select>
      </div>
    </div>

    <!-- KARTEN -->
    <ul class="wish-list">
      <li
        v-for="wish in filteredAndSortedWishes"
        :key="wish.id"
        class="wish-card"
      >
        <!-- ✅ ERFÜLLT BADGE RECHTS OBEN -->
        <span v-if="wish.fulfilled" class="fulfilled-badge">✓ erfüllt</span>

        <div v-if="editingWish?.id === wish.id">
          <input v-model="editingWish!.title" />
          <input v-model="editingWish!.name" />
          <input v-model="editingWish!.description" />
          <input v-model="editingWish!.status" />
          <input v-model.number="editingWish!.price" />

          <select v-model="editingWish!.priority">
            <option value="hoch">Hoch</option>
            <option value="mittel">Mittel</option>
            <option value="niedrig">Niedrig</option>
          </select>

          <button @click="updateWish">💾</button>
          <button @click="cancelEdit">❌</button>
        </div>

        <div v-else>
          <h3 class="wish-title">{{ wish.title }}</h3>

          <p class="description">{{ wish.description }}</p>

          <div class="details">
            <span><strong>Name:</strong> {{ wish.name }}</span>
            <span><strong>Status:</strong> {{ wish.status }}</span>
          </div>

          <div class="meta">
            <span class="badge" :class="wish.priority">{{ wish.priority }}</span>
            <span class="price">{{ wish.price }} €</span>
          </div>

          <div class="actions">
            <button @click="editWish(wish)">✏️</button>
            <button @click="deleteWish(wish.id!)">🗑️</button>
            <button v-if="!wish.fulfilled" @click="markAsFulfilled(wish)">✔️</button>
          </div>
        </div>
      </li>
    </ul>

    <div class="total">Gesamtsumme: {{ totalPrice }} €</div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.title {
  font-size: 1.6rem;
  font-weight: bold;
  color: #e840b2;
  margin-bottom: 1rem;
}

.wish-form,
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.wish-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.wish-card {
  position: relative; /* wichtig für Badge */
  background: white;
  border-radius: 1.2rem;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.fulfilled-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #d3f9d8;
  color: #2f9e44;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
}

.wish-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.description {
  color: #555;
  margin-bottom: 0.75rem;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #444;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.price {
  font-weight: bold;
  color: #e840b2;
}

.badge {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.hoch {
  background: #ffe3e3;
  color: #ef20ac;
}
.badge.mittel {
  background: #ffe3e3;
  color: #da5d98;
}
.badge.niedrig {
  background: #ffe3e3;
  color: #ed86a9;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.total {
  margin-top: 2rem;
  font-weight: bold;
}
</style>
