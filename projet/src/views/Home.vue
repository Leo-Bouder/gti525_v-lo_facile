<script setup>
import Button from '../components/Button.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToSavoir = () => {
  router.push('/savoir');
}
</script>

<template>
    <div class="d-flex flex-wrap justify-center align-center" style="min-height: 100vh;">
        <div class="mr-8 mb-4">
            <h1 class="text-grey-darken-3 font-weight-bold">Bienvenue sur Vélo Facile</h1>
            <Button color="var(--primary-main)" text="En savoir plus" @click="goToSavoir" />
        </div>
        <img
            src="../assets/vélo_facile_fond.png"
            alt="Cycliste"
            style="max-width: 400px; border-radius: 20px; box-shadow: 0 4px 24px #0002;"/>
    </div>
</template>