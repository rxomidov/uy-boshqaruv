<script setup>
import { reactive, ref, watch } from 'vue'
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
  is_blue_bay: Boolean(props.apartment?.is_blue_bay),
  additionalInfo: props.apartment?.additional_info || '',
})

const errors = ref({})

function clearApartmentFields() {
  form.fullName = ''
  form.phone = ''
  form.contract_number = ''
  form.paid_amount = ''
  form.rest_amount = ''
  form.additionalInfo = ''
  errors.value = {}
}

watch(
  () => form.is_blue_bay,
  (isBlueBay) => {
    if (isBlueBay) clearApartmentFields()
  },
  { immediate: true }
)

function validate() {
  if (form.is_blue_bay) {
    errors.value = {}
    return true
  }

  const e = {}
  if (!form.fullName.trim()) e.fullName = "Ism-familyani kiriting"
  if (!form.phone.trim()) e.phone = "Telefon raqamini kiriting"
  else if (!/^\+?\d[\d\s]{6,}$/.test(form.phone.trim())) e.phone = "Telefon raqami noto'g'ri formatda"
  if (!form.contract_number.trim()) e.contract_number = "Shartnoma raqamini kiriting"
  if (!form.paid_amount.trim()) e.paid_amount = "To'langan summani kiriting"
  // if (!form.rest_amount.trim()) e.rest_amount = "Qolgan summani kiriting"
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

function formPayload(status) {
  if (!form.is_blue_bay) return { ...form, status }

  return {
    ...form,
    fullName: '',
    phone: '',
    contract_number: '',
    paid_amount: '',
    rest_amount: '',
    additionalInfo: '',
    status,
  }
}

function submit() {
  if (!validate()) return
  emit('save', formPayload('filled'))
}

function markInvalid() {
  emit('save', formPayload('invalid'))
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
          <p>{{ getSquareFor(cell.block, cell.floor, cell.number) }} (m<sup>2</sup>)</p>
        </div>
        <button class="modal-close" type="button" aria-label="Yopish" @click="$emit('close')">✕</button>
      </div>

      <form class="modal-body" :class="{ 'modal-body--blue-bay': form.is_blue_bay }" @submit.prevent="submit">
        <label class="field">
          <span>ФИО <span style="color: red;">*</span></span>
          <input v-model="form.fullName" type="text" placeholder="Masalan: Aliyev Azizbek" :disabled="form.is_blue_bay" />
          <small v-if="errors.fullName" class="field-error">{{ errors.fullName }}</small>
        </label>

        <label class="field">
          <span>Телефон рақами <span style="color: red;">*</span></span>
          <input v-model="form.phone" type="tel" placeholder="+998 90 123 45 67" :disabled="form.is_blue_bay" />
          <small v-if="errors.phone" class="field-error">{{ errors.phone }}</small>
        </label>

        <label class="field">
          <span>Шартнoma рақами <span style="color: red;">*</span></span>
          <input v-model="form.contract_number" type="text" placeholder="16/000" :disabled="form.is_blue_bay" />
          <small v-if="errors.contract_number" class="field-error">{{ errors.contract_number }}</small>
        </label>
        <label class="field">
          <span>Тўланган сумма <span style="color: red;">*</span></span>
          <input
            v-model="form.paid_amount"
            type="text"
            inputmode="numeric"
            placeholder="000 000"
            :disabled="form.is_blue_bay"
            @input="formatAmountInput('paid_amount', $event)"
          />
          <small v-if="errors.paid_amount" class="field-error">{{ errors.paid_amount }}</small>
        </label>
        <label class="field">
          <span>Қолган сумма </span>
          <input
            v-model="form.rest_amount"
            type="text"
            inputmode="numeric"
            placeholder="000 000"
            :disabled="form.is_blue_bay"
            @input="formatAmountInput('rest_amount', $event)"
          />
          <small v-if="errors.rest_amount" class="field-error">{{ errors.rest_amount }}</small>
        </label>

        <label class="field-checkbox">
          <input v-model="form.is_blue_bay" type="checkbox" />
          <span>Blue Bay фирмасига берилган</span>
        </label>

        <label class="field">
          <span>Қўшимча маълумот</span>
          <textarea v-model="form.additionalInfo" rows="3" placeholder="Ixtiyoriy ma'lumot…" :disabled="form.is_blue_bay"></textarea>
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
