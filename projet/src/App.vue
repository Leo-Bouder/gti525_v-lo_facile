<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import MainContainer from './components/MainContainer.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const pagesWithMenu = ['Interet', 'Statistiques', 'Reseau'];

const hasMenu = computed(() => pagesWithMenu.includes(route.name))
</script>

<template>
  <v-app class="app-wrapper">
    <Header />
    <v-main>
      <MainContainer :haveMenu="hasMenu">
        <router-view />
      </MainContainer>
    </v-main>
    <Footer />
  </v-app>
</template>

<style>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.main-container {
  max-width: 1280px;
  width: 100%;
  height: 100%;
}
.v-main {
  max-height: 100vh;
}
td {
  text-align: left;
}
</style>
