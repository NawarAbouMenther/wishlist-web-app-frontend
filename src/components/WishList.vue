<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const listId = Number(route.params.id)

const API_URL = import.meta.env.VITE_API_URL

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
const newWish = ref<WishEntry>({
  title: "",
  name: "",
  description: "",
  status: "",
  price: 0,
  fulfilled: false,
  priority: "mittel"
})

const editingWish = ref<WishEntry | null>(null)

/// FILTERS
const sortOrder = ref<"asc" | "desc">("asc")
const filterStatus = ref<"all" | "open" | "fulfilled">("all")
const filterPriority = ref<"all" | "hoch" | "mittel" | "niedrig">("all")

onMounted(loadWishes)

async function loadWishes() {
  const res = await fetch(`${API_URL}/api/lists/${listId}/wishes`)
  wishes.value = await res.json()
}

async function addWish() {
  await fetch(`${API_URL}/api/lists/${listId}/wishes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newWish.value)
  })
  newWish.value = {
    title: "",
    name: "",
    description: "",
    status: "",
    price: 0,
    fulfilled: false,
    priority: "mittel"
  }
  loadWishes()
}

async function deleteWish(id: number) {
  await fetch(`${API_URL}/api/wishes/${id}`, { method: "DELETE" })
  loadWishes()
}

function editWish(w: WishEntry) {
  editingWish.value = { ...w }
}

async function updateWish() {
  if (!editingWish.value?.id) return
  await fetch(`${API_URL}/api/wishes/${editingWish.value.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingWish.value)
  })
  editingWish.value = null
  loadWishes()
}

async function markAsFulfilled(wish: WishEntry) {
  await fetch(`${API_URL}/api/wishes/${wish.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...wish, fulfilled: true })
  })
  loadWishes()
}

/// COMPUTED: FILTER + SORT
const filteredAndSortedWishes = computed(() => {
  let result = [...wishes.value]

  // STATUS
  if (filterStatus.value === "open") {
    result = result.filter(w => !w.fulfilled)
  }
  if (filterStatus.value === "fulfilled") {
    result = result.filter(w => w.fulfilled)
  }

  // PRIORITÄT
  if (filterPriority.value !== "all") {
    result = result.filter(w => w.priority === filterPriority.value)
  }

  // SORTIEREN
  result.sort((a, b) =>
    sortOrder.value === "asc"
      ? a.price - b.price
      : b.price - a.price
  )

  return result
})

const totalPrice = computed(() =>
  filteredAndSortedWishes.value.reduce((sum, w) => sum + w.price, 0)
)
</script>

<template>
  <div class="container">

    <h2 class="section-title">🎁 Neuen Wunsch hinzufügen</h2>

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

    <!-- FILTER UI -->
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

    <!-- GRID -->
    <div class="card-grid">
      <div v-for="wish in filteredAndSortedWishes" :key="wish.id" class="wish-card">

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

          <div class="actions">
            <button @click="updateWish">💾</button>
            <button @click="editingWish = null">❌</button>
          </div>
        </div>

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

    <div class="total">Gesamtsumme: {{ totalPrice }} €</div>

  </div>
</template>


<style scoped>
/* Hier bleibt DEIN komplettes Rosa-Design exakt wie vorher */

.container { padding: 2rem; }

.section-title {
  font-size: 2rem;
  font-weight: bold;
  color: #f162c4;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.wish-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.7rem;
  margin-bottom: 2rem;
}

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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.wish-card {
  background: white;
  padding: 1.6rem;
  border-radius: 1.2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: 0.25s ease;
  position: relative;
}

.wish-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 14px 32px rgba(0,0,0,0.15);
}

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
}

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

.details { display:flex; flex-direction:column; gap:.3rem; }

.price { color:#f162c4; font-weight:bold; }

.badge {
  margin-top: .7rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: bold;
  display: inline-block;
}

.badge.hoch { background:#ffd3e6; color:#d7006a; }
.badge.mittel { background:#ffe3f4; color:#ce4f97; }
.badge.niedrig { background:#fff0f9; color:#d57db0; }

.actions { display:flex; gap:.55rem; margin-top:1rem; }

.actions button {
  background:#f7f7f7;
  border:none;
  padding:.45rem .6rem;
  border-radius:.6rem;
  cursor:pointer;
  transition:.2s ease;
}

.actions button:hover {
  background:#ffe0f1;
  transform:translateY(-2px) scale(1.05);
}

.total {
  margin-top:2rem;
  font-size:1.3rem;
  font-weight:bold;
  color:#f162c4;
}
</style>
