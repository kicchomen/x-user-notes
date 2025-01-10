<template>
  <div class="mt-1 z-100 flex items-end font-sans select-none leading-1em">
    <button
      class="flex w-30 h-7 shadow cursor-pointer border-none text-white"
      bg="teal-600 hover:teal-700"
      @click="toggle()"
    >
      <pixelarticons-reciept-alt class="block m-auto text-lg" />
      Open Notes
    </button>
    <div class="tags"></div>
  </div>
</template>

<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import 'uno.css'

const [show, toggle] = useToggle(false)
</script>
