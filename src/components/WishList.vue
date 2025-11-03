<script lang="ts" setup>const wishes = [
  "Neuer Laptop",
  "Kopfhörer",
  "Sneaker",
  "Gamer Stuhl"
];
</script>

<template>
  <div>
    <h2>Meine Wishlist</h2>
    <ul>
      <li v-for="wish in wishes" :key="wish">{{ wish }}</li>
    </ul>
  </div>
</template>
