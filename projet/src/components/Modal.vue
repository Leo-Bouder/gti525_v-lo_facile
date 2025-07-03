<template>
  <div v-if="show" class="modal-overlay" @click="emitClose">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <span>{{ title }}</span><v-icon @click="emitClose" class="modal-close-button-x">mdi-close-circle-outline</v-icon>
      </div>
      <div class="modal-body">
        <slot></slot>
      </div>
      <div class="modal-footer">
        <button @click="emitClose" class="modal-close-button">Fermer</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: "Title"
    }
  },
  methods: {
    emitClose() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1005;
}

.modal-content {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 90%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
  max-width:1280px;
}

.modal-body {
  flex-grow: 1;
  padding: 15px 0;
  text-align: center;
  font-family: 'Inter', sans-serif;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-top: 3px solid;
  padding: 10px;
  background: var(--primary-main);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid ;
  background: var(--primary-main);
  padding: 10px;
}

.modal-header span {
    font-size: 1.5rem;
}

.modal-close-button {
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-close-button:hover {
  background-color: var(--hover-accent);
}

.modal-close-button-x {
    color: black;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
}

.modal-close-button-x:hover {
    color: rgb(51, 51, 51);
    border: none;
}
</style>
