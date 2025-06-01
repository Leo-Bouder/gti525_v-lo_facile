<script setup>
import HelloWorld from './components/HelloWorld.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import MainContainer from './components/MainContainer.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const pagesWithMenu = ['PointsInteret', 'Statistiques', 'Reseau'];

const hasMenu = computed(() => pagesWithMenu.includes(route.name))
</script>

<template>
  <v-app>
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
}
</style>
