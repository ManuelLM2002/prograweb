<script setup>
import { ref } from 'vue'

// Variables reactivas inicializadas en 0
const n1 = ref(0)
const n2 = ref(0)
const resultado = ref(null)

const calcular = (op) => {
  if (op === '+') resultado.value = n1.value + n2.value
  if (op === '-') resultado.value = n1.value - n2.value
  if (op === '*') resultado.value = n1.value * n2.value
  if (op === '/') resultado.value = n1.value / n2.value
}
</script>

<template>
  <div>
    <h2>Ejercicio 2 - Calculadora</h2>

    Numero 1: <input type="number" v-model.number="n1">
    <br><br>

    Numero 2: <input type="number" v-model.number="n2">
    <br><br>

    <button @click="calcular('+')">+</button>
    <button @click="calcular('-')">-</button>
    <button @click="calcular('*')">*</button>
    <button @click="calcular('/')">/</button>

    <br><br>

    Resultado: <span>{{ resultado }}</span>
  </div>
</template>