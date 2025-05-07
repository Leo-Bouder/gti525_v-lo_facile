<script setup>
//Fonction pour paramétrer le bouton avec une couleur et un texte
defineProps({
  color: String,
  text: String,
})
</script>

<template>
  <v-btn :style="{ backgroundColor: color }">
    {{ text }}
  </v-btn>
</template>

<style scoped>

</style>