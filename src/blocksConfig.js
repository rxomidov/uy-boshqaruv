// Uyning umumiy tuzilishi: 16 qavatli, lekin ma'lumot faqat 4- va 16-qavatlar
// oralig'ida (jami 13 qavat) kiritiladi. Har bir blokning bitta qavatidagi
// honadonlar soni turlicha.

export const FIRST_FLOOR = 4
export const LAST_FLOOR = 16

export const FLOORS = Array.from(
  { length: LAST_FLOOR - FIRST_FLOOR + 1 },
  (_, i) => LAST_FLOOR - i
) // [16, 15, ..., 4]

export const BLOCKS = [
  { key: 'A', name: 'A blok', color: '#2F6FED', perFloor: 9 },
  { key: 'B', name: 'B blok', color: '#1E8E5A', perFloor: 5 },
  { key: 'V', name: 'V blok', color: '#7C4FE0', perFloor: 9 },
  { key: 'G', name: 'G blok', color: '#E08A2F', perFloor: 9 },
  { key: 'D', name: 'D blok', color: '#12A199', perFloor: 5 },
  { key: 'E', name: 'E blok', color: '#E0447D', perFloor: 5 },
]

export function apartmentsInBlock(block) {
  return block.perFloor * FLOORS.length
}

export function totalApartments() {
  return BLOCKS.reduce((sum, b) => sum + apartmentsInBlock(b), 0)
}

export function cellKey(block, floor, number) {
  return `${block}-${floor}-${number}`
}

export const APARTMENT_TYPES = [
  '1 xonali',
  '2 xonali',
  '3 xonali',
  '4 xonali',
  "Ko'p xonali",
]
