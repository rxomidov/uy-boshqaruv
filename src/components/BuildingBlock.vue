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
function getSquareFor(block, floor, number) {
  if(block === 'A') {
    const squares = ['50.93', '58.32 a', '58.32 b', '58.44', '58.52', '65.69 a', '65.69 b', '62.67 a', '62.67 b']
    return `${squares[number - 1]}`
  }
  if(block === 'B') {
    const squares = ['67.02', '70.89', '72.16', '77.74', '98.26']
    return `${squares[number - 1]}`
  }
  if(block === 'V') {
    const squares = ['50,93', '58.32 а', '58.32 б', '58.44', '58.52', '65.69 а', '65.69 б', '67.62 а', '67.62 б']
    return `${squares[number - 1]}`
  }
  if(block === 'G') {
    const squares = ['50,93', '58.32 а', '58.32 б', '58.44', '58.52', '65.69 а', '65.69 б', '67.62 а', '67.62 б']
    return `${squares[number - 1]}`
  }
  if(block === 'D') {
    const squares = ['67.02', '70.89', '72.16', '77.74', '98.26']
    return `${squares[number - 1]}`
  }
  if(block === 'E') {
    const squares = ['54.33', '62.66', '72.42', '59.89', '65.72']
    return `${squares[number - 1]}`
  }
}

function statusFor(floor, number) {
  const row = props.apartments[cellKey(props.block.key, floor, number)]
  if (!row) return 'empty'
  if (row.is_blue_bay) return 'blue-bay'
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
      <!-- <p>{{ block.perFloor }} ta honadon / qavat</p> -->
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
          {{ getSquareFor(block.key, floor, number) }}
        </button>
      </div>
    </div>

    <!-- <div class="block-footer" :style="{ background: block.color }">{{ block.key }}</div> -->
  </section>
</template>
