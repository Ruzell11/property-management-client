<template>
  <div class="app">
    <header class="header">
      <router-link to="/" class="logo">
        <span class="logo-mark">⌂</span>
        <span class="logo-text">Property<em>Mgmt</em></span>
      </router-link>

   
    </header>

    <main class="main">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <footer class="footer">
      <span>PURE Home River &mdash; Property Management</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>