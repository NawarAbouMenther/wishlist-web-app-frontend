<template>
  <div class="item">
    <i><slot name="icon"></slot></i>
    <div class="details">
      <h3><slot name="heading" /></h3>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
}
i {
  width: 32px;
  height: 32px;
}
</style>
