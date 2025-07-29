<template>
  <div>
    <form class="form-container">
      <v-text-field
        v-model="email"
        label="Courriel"
        prepend-inner-icon="mdi-email"
        hide-details
        variant="outlined"
        density="comfortable"
        class="flex-grow-1"
      ></v-text-field>
      <v-text-field
        v-model="password"
        label="Mot de passe"
        prepend-inner-icon="mdi-form-textbox-password"
        hide-details
        variant="outlined"
        density="comfortable"
        class="flex-grow-1"
        type="password"
      ></v-text-field>
    <Button color="var(--primary-main)" text="Login" @click="signin" />
    </form>
    <p v-if="message" style="text-align: start; margin-top: 15px; color: red;">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import Button from "./button.vue";
import { useRouter } from "vue-router";
import { store } from "./store";

const email = ref("");
const password = ref("");
const message = ref("");

const router = useRouter();

const signin = async () => {
  try {
    const res = await axios.post("http://localhost:8000/gti525/v1/auth/login", {
      email: email.value,
      password: password.value,
    });
    const token = res.data.token;
    localStorage.setItem('token', token)
    store.token = token;
    router.push('/');
  } catch (err) {
    message.value = err.response?.data?.message || "Login failed";
  }
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}
</style>
