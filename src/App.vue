<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { supabase } from './supabaseClient'
import { BLOCKS, FLOORS, apartmentsInBlock, totalApartments, cellKey, getSquareFor } from './blocksConfig'
import BuildingBlock from './components/BuildingBlock.vue'
import ApartmentModal from './components/ApartmentModal.vue'

// apartments ma'lumotlari cellKey bo'yicha saqlanadi: { "A-16-1": {...row} }
const apartments = reactive({})
const loading = ref(true)
const loadError = ref('')

const activeCell = ref(null) // { block, floor, number }
const lockedCell = ref(null)
const contractCheck = ref('')
const contractError = ref('')
const summaryUnlocked = ref(false)
const summaryPasswordModal = ref(false)
const summaryPassword = ref('')
const summaryPasswordError = ref('')

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
  const cell = { block, floor, number }
  const apartment = apartments[cellKey(block, floor, number)]

  if (apartment && !apartment.is_blue_bay) {
    lockedCell.value = cell
    contractCheck.value = ''
    contractError.value = ''
    return
  }

  activeCell.value = cell
}

function closeCell() {
  activeCell.value = null
}

function closeContractCheck() {
  lockedCell.value = null
  contractCheck.value = ''
  contractError.value = ''
}

const activeApartment = computed(() => {
  if (!activeCell.value) return null
  const { block, floor, number } = activeCell.value
  return apartments[cellKey(block, floor, number)] || null
})

const lockedApartment = computed(() => {
  if (!lockedCell.value) return null
  const { block, floor, number } = lockedCell.value
  return apartments[cellKey(block, floor, number)] || null
})

function confirmContractCheck() {
  const expected = String(lockedApartment.value?.contract_number || '').replace(/\D/g, '')
  const entered = contractCheck.value.replace(/\D/g, '')

  if (entered === '170799' || (expected && entered === expected)) {
    activeCell.value = lockedCell.value
    closeContractCheck()
    return
  }

  contractError.value = "Shartnoma raqami noto'g'ri"
}

function parseAmount(value) {
  if (value === null || value === undefined) return 0
  const normalized = String(value).replace(/[^\d.-]/g, '')
  return Number(normalized) || 0
}

function formatAmount(value) {
  return new Intl.NumberFormat('uz-UZ').format(value)
}

function unlockSummary() {
  if (summaryPassword.value === 'qwerty123') {
    summaryUnlocked.value = true
    summaryPasswordModal.value = false
    summaryPassword.value = ''
    summaryPasswordError.value = ''
    return
  }

  summaryPasswordError.value = "Parol noto'g'ri"
}

const amountSummary = computed(() => {
  const totals = {
    paid: 0,
    rest: 0,
    cash: 0,
    terminal: 0,
    bank: 0,
    izmir: 0,
    blueBay: 0,
  }

  Object.values(apartments).forEach((apartment) => {
    totals.paid += parseAmount(apartment.paid_amount)
    totals.rest += parseAmount(apartment.rest_amount)
    totals.cash += parseAmount(apartment.cash_amount)
    totals.terminal += parseAmount(apartment.terminal_amount)
    totals.bank += parseAmount(apartment.bank_amount)
    if (apartment.is_blue_bay) totals.blueBay += 1
    else totals.izmir += 1
  })

  return totals
})

async function saveApartment(payload) {
  const { block, floor, number } = activeCell.value
  const record = {
    block,
    floor,
    number,
    full_name: payload.fullName,
    phone: payload.phone,
    contract_number: payload.contract_number,
    paid_amount: parseAmount(payload.paid_amount),
    rest_amount: parseAmount(payload.rest_amount),
    cash_amount: parseAmount(payload.cash_amount),
    terminal_amount: parseAmount(payload.terminal_amount),
    bank_amount: parseAmount(payload.bank_amount),
    is_blue_bay: Boolean(payload.is_blue_bay),
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
          <h1>Neom Tower TMJ</h1>
          <p>Барча блокдаги Хонадонлар ва маълумотлар</p>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><i class="dot dot-filled"></i>Шартнома киритилган</span>
        <span class="legend-item"><i class="dot dot-invalid"></i>Шартномада конфликт бор</span>
        <span class="legend-item"><i class="dot dot-blue"></i>Blue Bay</span>
        <span class="legend-item"><i class="dot dot-empty"></i>Шартнома киритилмаган</span>
      </div>
    </header>

    <p v-if="loading" class="status-line">Юкланмоқда…</p>
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
      <div class="summary-amounts">
        <div class="summary-amount summary-amount--blue-bay">
            <span class="summary-amount-label">Shartnoma kiritilmagan</span>
            <span class="">{{ total - amountSummary.blueBay - amountSummary.izmir }} ta</span>
          </div>
          <div class="summary-amount summary-amount--blue-bay">
            <span class="summary-amount-label">Blue bay firmasiga berilgan</span>
            <span class="summary-amount-value">{{ amountSummary.blueBay }} ta</span>
          </div>
          <div class="summary-amount summary-amount--izmir">
            <span class="summary-amount-label">Izmir jami shartnoma</span>
            <span class="summary-amount-value">{{ amountSummary.izmir }} ta</span>
          </div>
      </div>
      <div class="summary-amounts-wrap">
        <div class="summary-amounts" :class="{ 'summary-amounts--locked': !summaryUnlocked }">
        <div class="summary-amount summary-amount--all">
          <span class="summary-amount-label">Jami</span>
          <span class="summary-amount-value">{{ formatAmount(amountSummary.paid + amountSummary.rest) }} so'm</span>
        </div>
        <div class="summary-amount summary-amount--paid">
          <span class="summary-amount-label">Jami to'langan</span>
          <span class="summary-amount-value">{{ formatAmount(amountSummary.paid) }} so'm</span>
          <span style="font-size: 14px;">Naqd: {{ formatAmount(amountSummary.cash) }} so'm</span>
          <span style="font-size: 14px;">Terminal: {{ formatAmount(amountSummary.terminal) }} so'm</span>
          <span style="font-size: 14px;">Bank: {{ formatAmount(amountSummary.bank) }} so'm</span>
        </div>
        <div class="summary-amount summary-amount--rest">
          <span class="summary-amount-label">Jami qolgan</span>
          <span class="summary-amount-value">{{ formatAmount(amountSummary.rest) }} so'm</span>
        </div>
        </div>
        <div v-if="!summaryUnlocked" class="summary-amounts-lock">
          <button class="btn btn-primary" type="button" @click="summaryPasswordModal = true; summaryPasswordError = ''">Ko'rish</button>
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

    <div v-if="summaryPasswordModal" class="modal-backdrop" @click.self="summaryPasswordModal = false">
      <div class="modal summary-password-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <h3>Summalarni ko'rish</h3>
            <p>Davom etish uchun parolni kiriting.</p>
            <p>Yoki adminlarga murojaat qiling.</p>
          </div>
          <button class="modal-close" type="button" aria-label="Yopish" @click="summaryPasswordModal = false">x</button>
        </div>

        <form class="modal-body" @submit.prevent="unlockSummary">
          <label class="field">
            <span>Parol</span>
            <input v-model="summaryPassword" type="password" autocomplete="off" autofocus placeholder="Parolni kiriting" />
            <small v-if="summaryPasswordError" class="field-error">{{ summaryPasswordError }}</small>
          </label>
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="summaryPasswordModal = false">Bekor qilish</button>
            <button type="submit" class="btn btn-primary">Ochish</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="lockedCell && lockedApartment" class="modal-backdrop" @click.self="closeContractCheck">
      <div class="modal contract-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <h3>Кўриш учун шартнома рақамини киритинг</h3>
            <p>{{ lockedCell.block }} blok - {{ lockedCell.floor }}-qavat - {{ getSquareFor(lockedCell.block, lockedCell.floor, lockedCell.number) }} (m<sup>2</sup>)</p>
          </div>
          <button class="modal-close" type="button" aria-label="Yopish" @click="closeContractCheck">x</button>
        </div>

        <form class="modal-body" @submit.prevent="confirmContractCheck">
          <div class="contract-preview">
            <div>
              <span>ФИО</span>
              <strong>{{ lockedApartment.full_name || '-' }}</strong>
            </div>
            <div>
              <span>Телефон рақами </span>
              <strong>{{ lockedApartment.phone || '-' }}</strong>
            </div>
            <div>
              <span>Қўшимча маълумот</span>
              <strong>{{ lockedApartment.additional_info || '-' }}</strong>
            </div>
          </div>

          <label class="field">
            <span>Шартнoma рақами</span>
            <input v-model="contractCheck" type="text" autocomplete="off" autofocus placeholder="16/000" />
            <small v-if="contractError" class="field-error">{{ contractError }}</small>
          </label>

          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="closeContractCheck">Yopish</button>
            <button type="submit" class="btn btn-primary">Ochish</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
