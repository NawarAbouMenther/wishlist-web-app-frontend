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
  priority: 'hoch' | 'mittel' | 'niedrig'
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

/* ---------------- API ---------------- */

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

/* ---------------- FILTER + SORT ---------------- */

const filteredAndSortedWishes = computed(() => {
  let result = [...wishes.value]

  // Status-Filter
  if (filterStatus.value === 'fulfilled') {
    result = result.filter(w => w.fulfilled)
  } else if (filterStatus.value === 'open') {
    result = result.filter(w => !w.fulfilled)
  }

  // Prioritäts-Filter
  if (filterPriority.value !== 'all') {
    result = result.filter(w => w.priority === filterPriority.value)
  }

  // Sortieren nach Preis
  result.sort((a, b) =>
    sortOrder.value === 'asc' ? a.price - b.price : b.price - a.price
  )

  return result
})

const totalPrice = computed(() =>
  filteredAndSortedWishes.value.reduce((sum, w) => sum + w.price, 0)
)
</script>

<template>
  <div>
    <h2>Neuen Wunsch hinzufügen</h2>

    <form @submit.prevent="addWish">
      <input v-model="newWish.title" placeholder="Titel" required />
      <input v-model="newWish.name" placeholder="Name" required />
      <input v-model="newWish.description" placeholder="Beschreibung" required />
      <input v-model="newWish.status" placeholder="Status" required />
      <input v-model.number="newWish.price" type="number" placeholder="Preis (€)" required />

      <select v-model="newWish.priority">
        <option value="hoch">🔴 Hoch</option>
        <option value="mittel">🟡 Mittel</option>
        <option value="niedrig">🟢 Niedrig</option>
      </select>

      <button type="submit">Hinzufügen</button>
    </form>

    <h2>Meine Wunschliste</h2>

    <!-- SORT + FILTER -->
    <div style="margin-bottom: 1rem;">
      <strong>Preis:</strong>
      <button @click="sortOrder = 'asc'">⬆️</button>
      <button @click="sortOrder = 'desc'">⬇️</button>

      <strong style="margin-left: 1rem;">Status:</strong>
      <button @click="filterStatus = 'all'">Alle</button>
      <button @click="filterStatus = 'open'">Offen</button>
      <button @click="filterStatus = 'fulfilled'">Erfüllt</button>

      <strong style="margin-left: 1rem;">Priorität:</strong>
      <button @click="filterPriority = 'all'">Alle</button>
      <button @click="filterPriority = 'hoch'">🔴</button>
      <button @click="filterPriority = 'mittel'">🟡</button>
      <button @click="filterPriority = 'niedrig'">🟢</button>
    </div>

    <ul>
      <li v-for="wish in filteredAndSortedWishes" :key="wish.id">
        <div v-if="editingWish?.id === wish.id">
          <input v-model="editingWish!.title" />
          <input v-model="editingWish!.name" />
          <input v-model="editingWish!.description" />
          <input v-model="editingWish!.status" />
          <input v-model.number="editingWish!.price" />
          <select v-model="editingWish!.priority">
            <option value="hoch">🔴 Hoch</option>
            <option value="mittel">🟡 Mittel</option>
            <option value="niedrig">🟢 Niedrig</option>
          </select>

          <button @click="updateWish">💾</button>
          <button @click="cancelEdit">❌</button>
        </div>

        <div v-else>
          <h3>{{ wish.title }}</h3>
          <p>{{ wish.description }}</p>
          <p>Preis: {{ wish.price }} €</p>
          <p>Priorität: {{ wish.priority }}</p>

          <button @click="editWish(wish)">✏️</button>
          <button @click="deleteWish(wish.id!)">🗑️</button>
          <button v-if="!wish.fulfilled" @click="markAsFulfilled(wish)">✔️</button>

          <div v-if="wish.fulfilled" style="color: green">✅ erfüllt</div>
        </div>
      </li>
    </ul>

    <div style="margin-top: 1rem; font-weight: bold;">
      Gesamtsumme: {{ totalPrice }} €
    </div>
  </div>
</template>
