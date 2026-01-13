<script setup lang="ts">
import WelcomeItem from './WelcomeItem.vue'
import IconDocumentation from './icons/IconDocumentation.vue'
import IconTooling from './icons/IconTooling.vue'
import IconEcosystem from './icons/IconEcosystem.vue'
import IconCommunity from './icons/IconCommunity.vue'
import IconSupport from './icons/IconSupport.vue'
</script>

<template>
  <div>
    <WelcomeItem>
      <template #icon>
        <IconDocumentation />
      </template>
      <template #heading>Documentation</template>
      Vue documentation…
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <IconTooling />
      </template>
      <template #heading>Tooling</template>
      Vite tooling…
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <IconEcosystem />
      </template>
      <template #heading>Ecosystem</template>
      Vue ecosystem…
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <IconCommunity />
      </template>
      <template #heading>Community</template>
      Vue community…
    </WelcomeItem>

    <WelcomeItem>
      <template #icon>
        <IconSupport />
      </template>
      <template #heading>Support</template>
      Support Vue…
    </WelcomeItem>
  </div>
</template>
