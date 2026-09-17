<script setup>
import { cellKey } from '../blocksConfig'

const props = defineProps({
  block: { type: Object, required: true },
  floors: { type: Array, required: true },
  apartments: { type: Object, required: true },
})

const emit = defineEmits(['select'])

function numbersFor() {
  return Array.from({ length: props.block.perFloor }, (_, i) => i + 1)
}

function statusFor(floor, number) {
  const row = props.apartments[cellKey(props.block.key, floor, number)]
  if (!row) return 'empty'
  return row.status || 'filled'
}

function select(floor, number) {
  emit('select', props.block.key, floor, number)
}
</script>

<template>
  <section class="block-card">
    <div class="block-header" :style="{ background: block.color }">
      <h2>{{ block.name }}</h2>
      <p>{{ block.perFloor }} ta honadon / qavat</p>
    </div>

    <div class="block-grid">
      <div v-for="floor in floors" :key="floor" class="floor-row">
        <span class="floor-label">{{ floor }}</span>
        <button
          v-for="number in numbersFor()"
          :key="number"
          class="cell"
          :class="'cell--' + statusFor(floor, number)"
          :style="statusFor(floor, number) === 'filled' ? { background: block.color, borderColor: block.color } : {}"
          :aria-label="`${block.name}, ${floor}-qavat, ${number}-honadon`"
          type="button"
          @click="select(floor, number)"
        >
          {{ number }}
        </button>
      </div>
    </div>

    <div class="block-footer" :style="{ background: block.color }">{{ block.key }}</div>
  </section>
</template>
