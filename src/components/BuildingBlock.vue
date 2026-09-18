<script setup>
import { computed } from 'vue'
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
    const squares = ['50.93', '58.32 a', '58.32 b', '58.44', '58.52', '65.69 a', '65.69 b', '67.62 a', '67.62 b']
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

const blockSummary = computed(() => {
  const totals = {
    izmir: 0,
    blueBay: 0,
    empty: 0,
  }

  for (const floor of props.floors) {
    for (const number of numbersFor()) {
      const status = statusFor(floor, number)
      if (status === 'blue-bay') totals.blueBay += 1
      else if (status === 'empty') totals.empty += 1
      else if (status === 'filled') totals.izmir += 1
    }
  }

  return totals
})

function select(floor, number) {
  emit('select', props.block.key, floor, number)
}
</script>

<template>
  <section class="block-card">
    <div class="block-header" :style="{ background: block.color }">
      <h2>{{ block.name }}</h2>
      <div style="display: flex;">
        <span style="margin-left: 8px; display: flex; align-items: center;"><i class="dot dot-filled"></i>{{ blockSummary.izmir }}</span>
        <span style="margin-left: 8px; display: flex; align-items: center;"><i class="dot dot-blue"></i>{{ blockSummary.blueBay }}</span>
        <span style="margin-left: 8px; display: flex; align-items: center;"><i class="dot dot-empty"></i>{{ blockSummary.empty }}</span>
      </div>
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
          :aria-label="`${block.name}, ${floor}-qavat, ${number}-Xonadon`"
          type="button"
          @click="select(floor, number)"
        >
          {{ getSquareFor(block.key, floor, number) }}
        </button>
      </div>
    </div>

    <!-- <div class="block-footer">
      
    </div> -->
  </section>
</template>
