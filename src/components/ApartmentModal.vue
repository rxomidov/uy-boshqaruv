<script setup>
import { reactive, ref } from 'vue'
import { APARTMENT_TYPES } from '../blocksConfig'

const props = defineProps({
  cell: { type: Object, required: true },
  apartment: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save', 'clear'])

function formatCurrency(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('uz-UZ').format(Number(digits))
}

const form = reactive({
  fullName: props.apartment?.full_name || '',
  phone: props.apartment?.phone || '',
  contract_number: props.apartment?.contract_number || '',
  paid_amount: formatCurrency(props.apartment?.paid_amount),
  rest_amount: formatCurrency(props.apartment?.rest_amount),
  additionalInfo: props.apartment?.additional_info || '',
})

const errors = ref({})

function validate() {
  const e = {}
  if (!form.fullName.trim()) e.fullName = "Ism-familyani kiriting"
  if (!form.phone.trim()) e.phone = "Telefon raqamini kiriting"
  else if (!/^\+?\d[\d\s]{6,}$/.test(form.phone.trim())) e.phone = "Telefon raqami noto'g'ri formatda"
  errors.value = e
  return Object.keys(e).length === 0
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

function formatAmountInput(field, event) {
  form[field] = formatCurrency(event.target.value)
}

function submit() {
  if (!validate()) return
  emit('save', { ...form, status: 'filled' })
}

function markInvalid() {
  emit('save', { ...form, status: 'invalid' })
}

function clearData() {
  emit('clear')
}
</script>

<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <div>
          <h3>Хонадон маълумотлари</h3>
          <p>{{ cell.block }} блок • {{ cell.floor }}-қават • {{ cell.number }}-хонадон</p>
          <p>({{ getSquareFor(cell.block, cell.floor, cell.number) }} m<sup>2</sup>)</p>
        </div>
        <button class="modal-close" type="button" aria-label="Yopish" @click="$emit('close')">✕</button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <label class="field">
          <span>ФИО <span style="color: red;">*</span></span>
          <input v-model="form.fullName" type="text" placeholder="Masalan: Aliyev Azizbek" />
          <small v-if="errors.fullName" class="field-error">{{ errors.fullName }}</small>
        </label>

        <label class="field">
          <span>Телефон рақами <span style="color: red;">*</span></span>
          <input v-model="form.phone" type="tel" placeholder="+998 90 123 45 67" />
          <small v-if="errors.phone" class="field-error">{{ errors.phone }}</small>
        </label>

        <label class="field">
          <span>Шартнoma рақами <span style="color: red;">*</span></span>
          <input v-model="form.contract_number" type="text" placeholder="16/000" />
        </label>
        <label class="field">
          <span>Тўланган сумма <span style="color: red;">*</span></span>
          <input
            v-model="form.paid_amount"
            type="text"
            inputmode="numeric"
            placeholder="000 000"
            @input="formatAmountInput('paid_amount', $event)"
          />
        </label>
        <label class="field">
          <span>Қолган сумма <span style="color: red;">*</span></span>
          <input
            v-model="form.rest_amount"
            type="text"
            inputmode="numeric"
            placeholder="000 000"
            @input="formatAmountInput('rest_amount', $event)"
          />
        </label>

        <label class="field">
          <span>Қўшимча ма'lумот</span>
          <textarea v-model="form.additionalInfo" rows="3" placeholder="Ixtiyoriy ma'lumot…"></textarea>
        </label>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">Bekor qilish</button>
          <button
            v-if="apartment"
            type="button"
            class="btn btn-danger-outline"
            @click="markInvalid"
          >
            Noto'g'ri deb belgilash
          </button>
          <button
            v-if="apartment"
            type="button"
            class="btn btn-ghost"
            @click="clearData"
          >
            Ma'lumotni tozalash
          </button>
          <button type="submit" class="btn btn-primary">Saqlash</button>
        </div>
      </form>
    </div>
  </div>
</template>
