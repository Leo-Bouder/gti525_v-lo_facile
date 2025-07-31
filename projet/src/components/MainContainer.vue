<script>
import { watch } from 'vue';
import SideMenu from './SideMenu.vue';
import {store} from "./store"
export default {
  components: { 
    SideMenu
 },
  data() {
    return {
      year: ''
    }
  },
  props: {
    haveMenu: true
  }
}
</script>

<template>
    <div style="display: flex; height: calc(100vh - 120px);">
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