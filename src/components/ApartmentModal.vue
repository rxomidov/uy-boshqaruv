<script setup>
import { reactive, ref } from 'vue'
import { APARTMENT_TYPES } from '../blocksConfig'

const props = defineProps({
  cell: { type: Object, required: true },
  apartment: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save', 'clear'])

const form = reactive({
  fullName: props.apartment?.full_name || '',
  phone: props.apartment?.phone || '',
  passport: props.apartment?.passport || '',
  apartmentType: props.apartment?.apartment_type || APARTMENT_TYPES[0],
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
          <h3>Xonadon ma'lumotlari</h3>
          <p>{{ cell.block }} blok • {{ cell.floor }}-qavat • {{ cell.number }}-honadon</p>
        </div>
        <button class="modal-close" type="button" aria-label="Yopish" @click="$emit('close')">✕</button>
      </div>

      <form class="modal-body" @submit.prevent="submit">
        <label class="field">
          <span>Ism-familya *</span>
          <input v-model="form.fullName" type="text" placeholder="Masalan: Aliyev Azizbek" />
          <small v-if="errors.fullName" class="field-error">{{ errors.fullName }}</small>
        </label>

        <label class="field">
          <span>Telefon raqami *</span>
          <input v-model="form.phone" type="tel" placeholder="+998 90 123 45 67" />
          <small v-if="errors.phone" class="field-error">{{ errors.phone }}</small>
        </label>

        <label class="field">
          <span>Pasport ma'lumotlari</span>
          <input v-model="form.passport" type="text" placeholder="AA1234567" />
        </label>

        <label class="field">
          <span>Xonadon tipi</span>
          <select v-model="form.apartmentType">
            <option v-for="type in APARTMENT_TYPES" :key="type" :value="type">{{ type }}</option>
          </select>
        </label>

        <label class="field">
          <span>Qo'shimcha ma'lumot</span>
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
