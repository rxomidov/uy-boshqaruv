<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { supabase } from './supabaseClient'
import { BLOCKS, FLOORS, apartmentsInBlock, totalApartments, cellKey } from './blocksConfig'
import BuildingBlock from './components/BuildingBlock.vue'
import ApartmentModal from './components/ApartmentModal.vue'

// apartments ma'lumotlari cellKey bo'yicha saqlanadi: { "A-16-1": {...row} }
const apartments = reactive({})
const loading = ref(true)
const loadError = ref('')

const activeCell = ref(null) // { block, floor, number }

const total = totalApartments()

async function loadApartments() {
  loading.value = true
  loadError.value = ''
  const { data, error } = await supabase.from('apartments').select('*')
  if (error) {
    loadError.value =
      "Ma'lumotlarni yuklab bo'lmadi. Supabase ulanishini tekshiring: " + error.message
    loading.value = false
    return
  }
  for (const row of data) {
    apartments[cellKey(row.block, row.floor, row.number)] = row
  }
  loading.value = false
}

onMounted(loadApartments)

function openCell(block, floor, number) {
  activeCell.value = { block, floor, number }
}

function closeCell() {
  activeCell.value = null
}

const activeApartment = computed(() => {
  if (!activeCell.value) return null
  const { block, floor, number } = activeCell.value
  return apartments[cellKey(block, floor, number)] || null
})

async function saveApartment(payload) {
  const { block, floor, number } = activeCell.value
  const record = {
    block,
    floor,
    number,
    full_name: payload.fullName,
    phone: payload.phone,
    contractNumber: payload.contractNumber,
    additional_info: payload.additionalInfo,
    status: payload.status,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('apartments')
    .upsert(record, { onConflict: 'block,floor,number' })
    .select()
    .single()

  if (error) {
    alert("Saqlashda xatolik yuz berdi: " + error.message)
    return
  }

  apartments[cellKey(block, floor, number)] = data
  closeCell()
}

async function clearApartment() {
  const { block, floor, number } = activeCell.value
  const { error } = await supabase
    .from('apartments')
    .delete()
    .match({ block, floor, number })

  if (error) {
    alert("O'chirishda xatolik yuz berdi: " + error.message)
    return
  }

  delete apartments[cellKey(block, floor, number)]
  closeCell()
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="topbar-brand">
        <div class="brand-icon">🏢</div>
        <div>
          <h1>Uy boshqaruvi</h1>
          <p>Barcha blokdagi honadonlar va ma'lumotlar</p>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><i class="dot dot-filled"></i>Ma'lumot kiritilgan</span>
        <span class="legend-item"><i class="dot dot-invalid"></i>Ma'lumot noto'g'ri</span>
        <span class="legend-item"><i class="dot dot-empty"></i>Ma'lumot kiritilmagan</span>
      </div>
    </header>

    <p v-if="loading" class="status-line">Yuklanmoqda…</p>
    <p v-if="loadError" class="status-line status-error">{{ loadError }}</p>

    <main class="blocks-row" v-if="!loading">
      <BuildingBlock
        v-for="block in BLOCKS"
        :key="block.key"
        :block="block"
        :floors="FLOORS"
        :apartments="apartments"
        @select="openCell"
      />
    </main>

    <footer class="summary" v-if="!loading">
      <div class="summary-total">
        <div class="summary-total-icon">🏢</div>
        <div>
          <div class="summary-total-value">{{ total }} ta</div>
          <div class="summary-total-label">Jami uylar</div>
        </div>
      </div>
      <div class="summary-blocks">
        <div v-for="block in BLOCKS" :key="block.key" class="summary-block">
          <span class="summary-block-name" :style="{ color: block.color }">{{ block.name }}</span>
          <span class="summary-block-count">{{ apartmentsInBlock(block) }} ta</span>
        </div>
      </div>
    </footer>

    <ApartmentModal
      v-if="activeCell"
      :cell="activeCell"
      :apartment="activeApartment"
      @close="closeCell"
      @save="saveApartment"
      @clear="clearApartment"
    />
  </div>
</template>
