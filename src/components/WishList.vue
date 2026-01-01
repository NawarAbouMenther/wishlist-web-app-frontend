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
}

const wishes = ref<WishEntry[]>([])
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const newWish = ref<WishEntry>({
  title: '',
  name: '',
  description: '',
  status: '',
  price: 0,
  fulfilled: false
})

const editingWish = ref<WishEntry | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')
const filterStatus = ref<'all' | 'fulfilled' | 'open'>('all')

// 💡 Wünsche laden beim Mounten
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
      fulfilled: false
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

// ✅ Filtern + Sortieren
const filteredAndSortedWishes = computed(() => {
  let result = [...wishes.value]

  if (filterStatus.value === 'fulfilled') {
    result = result.filter(w => w.fulfilled)
  } else if (filterStatus.value === 'open') {
    result = result.filter(w => !w.fulfilled)
  }

  result.sort((a, b) =>
    sortOrder.value === 'asc' ? a.price - b.price : b.price - a.price
  )

  return result
})

// ✅ Gesamtsumme berechnen
const totalPrice = computed(() =>
  filteredAndSortedWishes.value.reduce((sum, wish) => sum + wish.price, 0)
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
      <button type="submit">Hinzufügen</button>
    </form>

    <h2>Meine Wunschliste</h2>

    <div style="margin-bottom: 1rem;">
      <strong>Sortieren nach Preis:</strong>
      <button @click="sortOrder = 'asc'">⬆️ Aufsteigend</button>
      <button @click="sortOrder = 'desc'">⬇️ Absteigend</button>

      <strong style="margin-left: 1rem;">Filtern:</strong>
      <button @click="filterStatus = 'all'">📋 Alle</button>
      <button @click="filterStatus = 'open'">🕓 Offen</button>
      <button @click="filterStatus = 'fulfilled'">✅ Erfüllt</button>
    </div>

    <ul>
      <li v-for="wish in filteredAndSortedWishes" :key="wish.id">
        <!-- Bearbeitungsmodus -->
        <div v-if="editingWish?.id === wish.id">
          <input v-model="editingWish!.title" placeholder="Titel" />
          <input v-model="editingWish!.name" placeholder="Name" />
          <input v-model="editingWish!.description" placeholder="Beschreibung" />
          <input v-model="editingWish!.status" placeholder="Status" />
          <input v-model.number="editingWish!.price" type="number" placeholder="Preis (€)" />
          <button @click="updateWish">💾 Speichern</button>
          <button @click="cancelEdit">❌ Abbrechen</button>
        </div>

        <!-- Normalansicht -->
        <div v-else>
          <h3>{{ wish.title }}</h3>
          <p><strong>Name:</strong> {{ wish.name }}</p>
          <p><strong>Beschreibung:</strong> {{ wish.description }}</p>
          <p><strong>Status:</strong> {{ wish.status }}</p>
          <p><strong>Preis:</strong> {{ wish.price }} €</p>

          <button @click="editWish(wish)">✏️ Bearbeiten</button>
          <button @click="deleteWish(wish.id!)">🗑️ Löschen</button>
          <button v-if="!wish.fulfilled" @click="markAsFulfilled(wish)">
            ✔️ Als erfüllt markieren
          </button>

          <div v-if="wish.fulfilled" style="color: green; font-weight: bold">
            ✅ erfüllt!
          </div>
        </div>
      </li>
    </ul>

    <!-- ✅ Gesamtsumme anzeigen -->
    <div style="margin-top: 1rem; font-weight: bold;">
      Gesamtsumme: {{ totalPrice }} €
    </div>
  </div>
</template>
