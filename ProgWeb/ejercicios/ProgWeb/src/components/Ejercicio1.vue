<script setup>
import { ref } from 'vue'

// Un arreglo reactivo para controlar qué contenido está visible
const visible = ref([false, false, false])

const mostrar = (index) => {
  // Invertimos el valor actual (de true a false o viceversa)
  visible.value[index] = !visible.value[index]
}
</script>

<template>
  <div>
    <h2>Ejercicio 1 - Acordeón</h2>

    <button @click="mostrar(0)">Opción 1</button>
    <div v-show="visible[0]" class="contenido">Contenido del botón 1.</div>

    <button @click="mostrar(1)">Opción 2</button>
    <div v-show="visible[1]" class="contenido">Contenido del botón 2.</div>

    <button @click="mostrar(2)">Opción 3</button>
    <div v-show="visible[2]" class="contenido">Contenido del botón 3.</div>
  </div>
</template>

<style scoped>
/* En Vue, 'scoped' hace que este CSS solo afecte a este componente */
.contenido {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid black;
}
</style>