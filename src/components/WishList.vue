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

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'hoch': return '#ffb3c6'
    case 'mittel': return '#ffc2d1'
    case 'niedrig': return '#ffe5ec'
    default: return '#ffffff'
  }
}

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
</script>

<template>
  <div class="container">
    <section class="form-section">
      <h2>🎁 <strong>Neuen Wunsch hinzufügen</strong></h2>
      <form @submit.prevent="addWish">
        <input v-model="newWish.title" placeholder="Titel" required />
        <input v-model="newWish.name" placeholder="Name" required />
        <input v-model="newWish.description" placeholder="Beschreibung" required />
        <input v-model="newWish.status" placeholder="Status" required />
        <input v-model.number="newWish.price" type="number" placeholder="Preis (€)" required />
        <select v-model="newWish.priority">
          <option value="hoch" :style="{ backgroundColor: getPriorityColor('hoch') }">Hoch</option>
          <option value="mittel" :style="{ backgroundColor: getPriorityColor('mittel') }">Mittel</option>
          <option value="niedrig" :style="{ backgroundColor: getPriorityColor('niedrig') }">Niedrig</option>
        </select>
        <button type="submit">➕ Hinzufügen</button>
      </form>
    </section>

    <section>
      <h2>🖋 <strong>Meine Wunschliste</strong></h2>

      <div class="controls">
        <span>Sortieren nach Preis:</span>
        <button @click="sortOrder = 'asc'">🔼 Aufsteigend</button>
        <button @click="sortOrder = 'desc'">🔽 Absteigend</button>

        <span>Filtern nach Status:</span>
        <button @click="filterStatus = 'all'">📄 Alle</button>
        <button @click="filterStatus = 'open'">⏳ Offen</button>
        <button @click="filterStatus = 'fulfilled'">✅ Erfüllt</button>

        <span>Priorität:</span>
        <select v-model="filterPriority">
          <option value="all">Alle</option>
          <option value="hoch" :style="{ backgroundColor: getPriorityColor('hoch') }">Hoch</option>
          <option value="mittel" :style="{ backgroundColor: getPriorityColor('mittel') }">Mittel</option>
          <option value="niedrig" :style="{ backgroundColor: getPriorityColor('niedrig') }">Niedrig</option>
        </select>
      </div>

      <ul>
        <li v-for="wish in filteredAndSortedWishes" :key="wish.id" class="wish-card" :style="{ backgroundColor: getPriorityColor(wish.priority) }">
          <div v-if="editingWish?.id === wish.id">
            <input v-model="editingWish!.title" />
            <input v-model="editingWish!.name" />
            <input v-model="editingWish!.description" />
            <input v-model="editingWish!.status" />
            <input v-model.number="editingWish!.price" type="number" />
            <select v-model="editingWish!.priority">
              <option value="hoch" :style="{ backgroundColor: getPriorityColor('hoch') }">Hoch</option>
              <option value="mittel" :style="{ backgroundColor: getPriorityColor('mittel') }">Mittel</option>
              <option value="niedrig" :style="{ backgroundColor: getPriorityColor('niedrig') }">Niedrig</option>
            </select>
            <button @click="updateWish">💾 Speichern</button>
            <button @click="cancelEdit">❌ Abbrechen</button>
          </div>

          <div v-else>
            <h3>{{ wish.title }}</h3>
            <p><strong>Name:</strong> {{ wish.name }}</p>
            <p><strong>Beschreibung:</strong> {{ wish.description }}</p>
            <p><strong>Status:</strong> {{ wish.status }}</p>
            <p><strong>Preis:</strong> {{ wish.price }} €</p>
            <p><strong>Priorität:</strong> {{ wish.priority }}</p>

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

      <div style="margin-top: 1rem; font-weight: bold">
        Gesamtsumme: {{ totalPrice }} €
      </div>
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  background-color: #fff0f5;
  padding: 1rem;
  border-radius: 8px;
}

.controls {
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.wish-card {
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
