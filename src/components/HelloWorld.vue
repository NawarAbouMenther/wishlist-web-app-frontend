<script setup lang="ts">
defineProps<{ msg?: string }>()
</script>

<template>
  <div class="hello">
    {{ msg }}
  </div>
</template>

<style scoped>
.hello {
  font-size: 1rem;
  color: #333;
}
</style>
