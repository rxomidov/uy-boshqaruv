# Uy boshqaruvi — Vue 3 + Supabase

16 qavatli uydagi 6 blok (A, B, V, G, D, E) uchun honadonlar va yashovchilar
ma'lumotlarini boshqarish sayti. Har bir honadon katak sifatida ko'rsatiladi,
ustiga bosilganda ma'lumot kiritish oynasi (modal) ochiladi.

- **Yashil katak** — ma'lumot to'liq va to'g'ri kiritilgan
- **Oq katak** — ma'lumot hali kiritilmagan
- **Qizil katak** — ma'lumot noto'g'ri deb belgilangan (modal ichidagi
  "Noto'g'ri deb belgilash" tugmasi orqali)

## Texnologiyalar

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/) — build vositasi
- [Supabase](https://supabase.com/) — ma'lumotlar bazasi (Postgres) va API

## 1. Supabase loyihasini sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating.
2. Loyiha ichida **SQL Editor** bo'limini oching va quyidagi skriptni
   ishga tushiring:

```sql
create extension if not exists "pgcrypto";

create table if not exists apartments (
  id uuid primary key default gen_random_uuid(),
  block text not null check (block in ('A', 'B', 'V', 'G', 'D', 'E')),
  floor int not null check (floor between 4 and 16),
  number int not null check (number > 0),
  full_name text,
  phone text,
  passport text,
  apartment_type text,
  additional_info text,
  status text not null default 'filled' check (status in ('filled', 'invalid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (block, floor, number)
);

alter table apartments enable row level security;

-- Demo/ichki boshqaruv paneli uchun soddalashtirilgan ruxsatlar.
-- Haqiqiy loyihada bu policy'larni autentifikatsiya (masalan, faqat
-- tizimga kirgan adminlar) bilan cheklashni unutmang.
create policy "Public read" on apartments
  for select using (true);

create policy "Public write" on apartments
  for insert with check (true);

create policy "Public update" on apartments
  for update using (true);

create policy "Public delete" on apartments
  for delete using (true);
```

3. **Project Settings → API** bo'limidan `Project URL` va `anon public`
   kalitni nusxalab oling.

## 2. Loyihani ishga tushirish

```bash
npm install
cp .env.example .env
# .env faylini oching va o'z Supabase URL/kalitingizni kiriting
npm run dev
```

Ishlab chiqarish (production) uchun build qilish:

```bash
npm run build
npm run preview
```

## 3. Loyiha tuzilishi

```
src/
  blocksConfig.js        # bloklar, qavatlar, honadon sonlari
  supabaseClient.js       # Supabase klientini yaratish
  App.vue                 # asosiy sahifa: ma'lumotlarni yuklash, modal boshqaruvi
  components/
    BuildingBlock.vue     # bitta blokning ustuni (qavatlar va honadon katakchalari)
    ApartmentModal.vue    # honadon ma'lumotlarini kiritish/tahrirlash oynasi
```

Bloklar, qavatlar oralig'i yoki har qavatdagi honadonlar sonini o'zgartirish
uchun faqat `src/blocksConfig.js` faylini tahrirlash kifoya — qolgan barcha
komponentlar shu konfiguratsiyaga qarab avtomatik moslashadi.

## 4. Xavfsizlik bo'yicha eslatma

Yuqoridagi SQL policy'lar demo maqsadida **hamma uchun ochiq** qilib
yozilgan (chunki sayt hozircha login tizimisiz). Real foydalanishda:

- Supabase Auth orqali admin foydalanuvchilarni kiritish,
- policy'larni `auth.uid()` asosida cheklash,
- `anon` kalit o'rniga faqat kerakli amallarga ruxsat beruvchi rol yaratish

tavsiya etiladi.
