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

// FORM INPUT
const newWish = ref<WishEntry>({
  title: '',
  name: '',
  description: '',
  status: '',
  price: 0,
  fulfilled: false,
  priority: 'mittel'
})

// EDIT
const editingWish = ref<WishEntry | null>(null)

// FILTERS
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

// FILTERS + SORT
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

    <!-- TITLE -->
    <h2 class="section-title">🎁 Neuen Wunsch hinzufügen</h2>

    <!-- FORM -->
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

      <button type="submit" class="btn-add">➕ Hinzufügen</button>
    </form>

    <h2 class="section-title">📋 Meine Wunschliste</h2>

    <!-- FILTERS -->
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

    <!-- CARD GRID -->
    <div class="card-grid">
      <div
        v-for="wish in filteredAndSortedWishes"
        :key="wish.id"
        class="wish-card"
      >
        <!-- BADGE -->
        <span v-if="wish.fulfilled" class="fulfilled-badge">
          ✓ erfüllt
        </span>

        <!-- EDIT MODE -->
        <div v-if="editingWish?.id === wish.id" class="edit-fields">
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

          <div class="actions">
            <button @click="updateWish">💾</button>
            <button @click="cancelEdit">❌</button>
          </div>
        </div>

        <!-- DISPLAY MODE -->
        <div v-else>
          <h3 class="wish-title">{{ wish.title }}</h3>
          <p class="wish-desc">{{ wish.description }}</p>

          <div class="details">
            <span><strong>Name:</strong> {{ wish.name }}</span>
            <span><strong>Status:</strong> {{ wish.status }}</span>
            <span class="price">{{ wish.price }} €</span>
          </div>

          <div class="meta">
            <span class="badge" :class="wish.priority">{{ wish.priority }}</span>
          </div>

          <div class="actions">
            <button @click="editWish(wish)">✏️</button>
            <button @click="deleteWish(wish.id!)">🗑️</button>
            <button v-if="!wish.fulfilled" @click="markAsFulfilled(wish)">✔️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- TOTAL -->
    <div class="total">Gesamtsumme: {{ totalPrice }} €</div>

  </div>
</template>

<style scoped>
/* Layout */
.container {
  padding: 2rem;
}

/* TITLE */
.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #f162c4;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

/* FORM */
.wish-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.7rem;
  margin-bottom: 2rem;
}

/* ADD BUTTON – animated */
.btn-add {
  background: #f162c4;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 0.8rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: 0.25s ease;
  box-shadow: 0 4px 10px rgba(255, 105, 180, 0.3);
}

.btn-add:hover {
  background: #ff6cc0;
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 8px 18px rgba(255, 105, 180, 0.45);
}

/* GRID */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

/* INDIVIDUAL CARD */
.wish-card {
  background: white;
  padding: 1.6rem;
  border-radius: 1.2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: 0.25s ease;
  position: relative;
  transform: translateY(0px);
}

.wish-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 14px 32px rgba(0,0,0,0.15);
}

/* BADGE */
.fulfilled-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #d4f7d4;
  color: #1a8f3c;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

/* CARD TEXT */
.wish-title {
  font-size: 1.35rem;
  font-weight: bold;
  margin-bottom: .4rem;
}

.wish-desc {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1rem;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.9rem;
}

.price {
  color: #f162c4;
  font-weight: bold;
}

/* PRIORITY BADGES */
.badge {
  margin-top: .7rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-block;
}

.badge.hoch { background: #ffd3e6; color: #d7006a; }
.badge.mittel { background: #ffe3f4; color: #ce4f97; }
.badge.niedrig { background: #fff0f9; color: #d57db0; }

/* ACTION BUTTONS */
.actions {
  display: flex;
  gap: 0.55rem;
  margin-top: 1rem;
}

.actions button {
  background: #f7f7f7;
  border: none;
  padding: 0.45rem 0.6rem;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.actions button:hover {
  background: #ffe0f1;
  transform: translateY(-2px) scale(1.05);
}

/* TOTAL */
.total {
  margin-top: 2rem;
  font-size: 1.3rem;
  font-weight: bold;
  color: #f162c4;
}
</style>
