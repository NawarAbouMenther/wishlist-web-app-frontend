<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface WishEntry {
  id: number;
  title: string;
  name: string;
  description: string;
  status: string;
  price: number;
}

const wishes = ref<WishEntry[]>([]);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/api/wishes`);
    if (!response.ok) throw new Error('Fehler beim Laden');
    wishes.value = await response.json();
  } catch (err) {
    console.error('Fehler beim Abrufen der Wünsche:', err);
  }
});
</script>

<template>
  <div>
    <h2>Meine Wunschliste</h2>
    <ul>
      <li v-for="wish in wishes" :key="wish.id">
        <h3>{{ wish.title }}</h3>
        <p><strong>Name:</strong> {{ wish.name }}</p>
        <p><strong>Beschreibung:</strong> {{ wish.description }}</p>
        <p><strong>Status:</strong> {{ wish.status }}</p>
        <p><strong>Preis:</strong> {{ wish.price }} €</p>
      </li>
    </ul>
  </div>
</template>
