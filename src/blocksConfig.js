// Uyning umumiy tuzilishi: 16 qavatli, lekin ma'lumot faqat 4- va 16-qavatlar
// oralig'ida (jami 13 qavat) kiritiladi. Har bir blokning bitta qavatidagi
// Xonadonlar soni turlicha.

export const FIRST_FLOOR = 4
export const LAST_FLOOR = 16

export const FLOORS = Array.from(
  { length: LAST_FLOOR - FIRST_FLOOR + 1 },
  (_, i) => LAST_FLOOR - i
) // [16, 15, ..., 4]

export const BLOCKS = [
  { key: 'A', name: 'А блок', color: '#1E8E5A', perFloor: 9 },
  { key: 'B', name: 'Б блок', color: '#1E8E5A', perFloor: 5 },
  { key: 'V', name: 'В блок', color: '#1E8E5A', perFloor: 9 },
  { key: 'G', name: 'Г блок', color: '#1E8E5A', perFloor: 9 },
  { key: 'D', name: 'Д блок', color: '#1E8E5A', perFloor: 5 },
  { key: 'E', name: 'Е блок', color: '#1E8E5A', perFloor: 5 },
]

export function getSquareFor(block, floor, number) {
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
