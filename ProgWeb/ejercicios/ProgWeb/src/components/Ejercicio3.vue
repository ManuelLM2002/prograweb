<script setup>
import { ref } from 'vue'

const tamaño = ref(300)

const agrandar = () => {
  tamaño.value += 20
}

const reducir = () => {
  tamaño.value -= 20
}
</script>

<template>
  <div>
    <h2>Ejercicio 3 - Cambiar tamaño de imagen</h2>

    <img src="/img.png" :width="tamaño" alt="Imagen de prueba">

    <br><br>

    <button @click="agrandar()">+</button>
    <button @click="reducir()">-</button>
  </div>
</template>