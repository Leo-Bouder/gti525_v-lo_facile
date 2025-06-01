<script setup>
</script>

<template>
  <v-app-bar class="bg-light-green-lighten-3 border-b-lg">
    <v-app-bar-title class="text-left">
      <div class="d-flex align-center">
        <img src="../assets/logo.png" alt="Logo Vélo Facile" style="height: 40px; margin-right: 12px;">
        <span style="font-size: 2rem;">Vélo Facile</span>
      </div>
    </v-app-bar-title>
    <v-spacer />
    <!-- Navigation avec router-link -->
    <v-btn class="pr-3" text to="/" tag="router-link">
      Accueil
    </v-btn>
    <v-btn class="pr-3" text to="/reseau" tag="router-link">
      Réseau Cyclable
    </v-btn>
    <v-btn class="pr-3" text to="/statistiques" tag="router-link">
      Statistiques
    </v-btn>
    <v-btn class="pr-3" text to="/interet" tag="router-link">
      Points d'intérêt
    </v-btn>
    <v-btn text to="/connexion" tag="router-link">
      Se connecter
    </v-btn>
    <v-btn class="pr-3" text to="/inscription" tag="router-link">
      S'inscrire
    </v-btn>
  </v-app-bar>
</template>

<style scoped>

</style>