<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

// Neues Wunschobjekt fürs Formular
const newWish = ref<WishEntry>({
  title: '',
  name: '',
  description: '',
  status: '',
  price: 0,
  fulfilled: false
})

// Laden beim Start
onMounted(loadWishes)

async function loadWishes() {
  const response = await fetch(`${API_URL}/api/wishes`)
  const data: WishEntry[] = await response.json()
  wishes.value = data
}

async function addWish() {
  const response = await fetch(`${API_URL}/api/wishes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newWish.value)
  })

  if (response.ok) {
    // Liste neu laden
    await loadWishes()
    // Formular leeren
    newWish.value = { title: '', name: '', description: '', status: '', price: 0, fulfilled: false }
  } else {
    alert('Fehler beim Speichern')
  }
}

async function deleteWish(id: number) {
  const response = await fetch(`${API_URL}/api/wishes/${id}`, {
    method: 'DELETE'
  })

  if (response.ok) {
    await loadWishes() // Liste neu laden
  } else {
    console.error('Fehler beim Löschen des Wunschs')
  }
}

async function markAsFulfilled(id: number) {
  const response = await fetch(`${API_URL}/api/wishes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fulfilled: true })
  })

  if (response.ok) {
    await loadWishes()
  } else {
    console.error('Fehler beim Aktualisieren des Wunschs')
  }
}


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
    <ul>
      <li v-for="wish in wishes" :key="wish.id">
        <h3>{{ wish.title }}</h3>
        <p><strong>Name:</strong> {{ wish.name }}</p>
        <p><strong>Beschreibung:</strong> {{ wish.description }}</p>
        <p><strong>Status:</strong> {{ wish.status }}</p>
        <p><strong>Preis:</strong> {{ wish.price }} €</p>
        <button v-if="wish.id !== undefined" @click="deleteWish(wish.id)">🗑️ Löschen</button>
        <button v-if="wish.id !== undefined" @click="markAsFulfilled(wish.id)">✔️ Als erfüllt markieren</button>
        <div v-if="wish.fulfilled" style="color: green; font-weight: bold">
          ✅ erfüllt!
        </div>


      </li>
    </ul>
  </div>


</template>
