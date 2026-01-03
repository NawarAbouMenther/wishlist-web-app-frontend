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
  try {
    const response = await fetch(`${API_URL}/api/wishes`)
    if (!response.ok) throw new Error('Fehler beim Laden')
    wishes.value = await response.json()
  } catch (error) {
    alert('Fehler beim Laden der Daten')
    console.error(error)
  }
}

async function addWish() {
  try {
    const response = await fetch(`${API_URL}/api/wishes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWish.value)
    })

    if (!response.ok) throw new Error('Fehler beim Speichern')

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
  } catch (error) {
    alert('Fehler beim Speichern')
    console.error(error)
  }
}

async function deleteWish(id: number) {
  try {
    const response = await fetch(`${API_URL}/api/wishes/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Fehler beim Löschen')
    await loadWishes()
  } catch (error) {
    alert('Fehler beim Löschen')
    console.error(error)
  }
}

function editWish(wish: WishEntry) {
  editingWish.value = { ...wish }
}

async function updateWish() {
  if (!editingWish.value?.id) return

  try {
    const response = await fetch(`${API_URL}/api/wishes/${editingWish.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingWish.value)
    })

    if (!response.ok) throw new Error('Fehler beim Aktualisieren')

    editingWish.value = null
    await loadWishes()
  } catch (error) {
    alert('Fehler beim Aktualisieren')
    console.error(error)
  }
}

function cancelEdit() {
  editingWish.value = null
}

async function markAsFulfilled(wish: WishEntry) {
  try {
    const updatedWish = { ...wish, fulfilled: true }
    const response = await fetch(`${API_URL}/api/wishes/${wish.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWish)
    })
    if (!response.ok) throw new Error('Fehler beim Aktualisieren')
    await loadWishes()
  } catch (error) {
    alert('Fehler beim Aktualisieren')
    console.error(error)
  }
}

const filteredAndSortedWishes = computed(() => {
  let result = [...wishes.value]

  if (filterStatus.value === 'fulfilled') {
    result = result.filter(w => w.fulfilled)
  } else if (filterStatus.value === 'open') {
    result = result.filter(w => !w.fulfilled)
  }

  if (filterPriority.value !== 'all') {
    result = result.filter(w => w.priority === filterPriority.value)
  }

  result.sort((a, b) =>
    sortOrder.value === 'asc' ? a.price - b.price : b.price - a.price
  )

  return result
})

const totalPrice = computed(() =>
  filteredAndSortedWishes.value.reduce((sum, wish) => sum + wish.price, 0)
)

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'hoch': return '#d63384'; // dunkelrosa
    case 'mittel': return '#f3a3c4'; // mittelrosa
    case 'niedrig': return '#fce4ec'; // hellrosa
    default: return '#f8f9fa';
  }
}
</script>

<template>
  <div style="max-width: 800px; margin: auto; padding: 2rem; font-family: sans-serif">
    <h2 style="margin-bottom: 1rem; color: #6f42c1">✨ Neuen Wunsch hinzufügen</h2>
    <form @submit.prevent="addWish" style="background: #f8f9fa; padding: 1rem; border-radius: 1rem; box-shadow: 0 2px 10px #ccc; margin-bottom: 2rem">
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
      <button type="submit">➕ Hinzufügen</button>
    </form>

    <h2 style="color: #6f42c1">📋 Meine Wunschliste</h2>

    <div style="margin: 1rem 0">
      <strong>Sortieren nach Preis:</strong>
      <button @click="sortOrder = 'asc'">⬆️</button>
      <button @click="sortOrder = 'desc'">⬇️</button>

      <strong style="margin-left: 1rem">Status:</strong>
      <button @click="filterStatus = 'all'">Alle</button>
      <button @click="filterStatus = 'open'">Offen</button>
      <button @click="filterStatus = 'fulfilled'">Erfüllt</button>

      <strong style="margin-left: 1rem">Priorität:</strong>
      <select v-model="filterPriority">
        <option value="all">Alle</option>
        <option value="hoch">🔴 Hoch</option>
        <option value="mittel">🟡 Mittel</option>
        <option value="niedrig">🟢 Niedrig</option>
      </select>
    </div>

    <div v-for="wish in filteredAndSortedWishes" :key="wish.id" :style="`background: ${getPriorityColor(wish.priority)}; padding: 1rem; border-radius: 1rem; margin-bottom: 1rem; box-shadow: 0 2px 5px #ccc;`">
      <div v-if="editingWish?.id === wish.id">
        <input v-model="editingWish!.title" placeholder="Titel" />
        <input v-model="editingWish!.name" placeholder="Name" />
        <input v-model="editingWish!.description" placeholder="Beschreibung" />
        <input v-model="editingWish!.status" placeholder="Status" />
        <input v-model.number="editingWish!.price" type="number" placeholder="Preis (€)" />
        <select v-model="editingWish!.priority">
          <option value="hoch">🔴 Hoch</option>
          <option value="mittel">🟡 Mittel</option>
          <option value="niedrig">🟢 Niedrig</option>
        </select>
        <button @click="updateWish">💾 Speichern</button>
        <button @click="cancelEdit">❌ Abbrechen</button>
      </div>
      <div v-else>
        <h3 style="margin-bottom: 0.3rem">{{ wish.title }}</h3>
        <p><strong>Name:</strong> {{ wish.name }}</p>
        <p><strong>Beschreibung:</strong> {{ wish.description }}</p>
        <p><strong>Status:</strong> {{ wish.status }}</p>
        <p><strong>Preis:</strong> {{ wish.price }} €</p>
        <p><strong>Priorität:</strong> {{ wish.priority }}</p>
        <div style="margin-top: 0.5rem">
          <button @click="editWish(wish)">✏️ Bearbeiten</button>
          <button @click="deleteWish(wish.id!)">🗑️ Löschen</button>
          <button v-if="!wish.fulfilled" @click="markAsFulfilled(wish)">✔️ Erfüllt</button>
          <span v-else style="color: green; font-weight: bold">✅ Erfüllt</span>
        </div>
      </div>
    </div>

    <div style="font-weight: bold; margin-top: 1rem">Gesamtsumme: {{ totalPrice }} €</div>
  </div>
</template>
