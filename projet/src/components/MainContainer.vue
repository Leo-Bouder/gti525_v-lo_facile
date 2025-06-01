<script setup>
import SideMenu from './SideMenu.vue';
defineProps
({
    haveMenu: Boolean
})
</script>

<template>
    <div style="display: flex; height: 100%;">
        <SideMenu 
            v-if="haveMenu===true"
        />
        <div style="display: flex; align-items: center; flex: 1; flex-direction: column;">
            <div class="main-container">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped></style>