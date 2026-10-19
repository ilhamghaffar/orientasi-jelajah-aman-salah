# Jelajah Aman

## Identitas

- **Nama:** Candra
- **Nama project:** Orientasi Jelajah Aman

## Definisi project

Jelajah Aman adalah aplikasi mobile untuk membantu pengguna melihat informasi cuaca dan kualitas udara di berbagai kota. Pengguna dapat mencari kota, memilih hasil pencarian, lalu melihat suhu saat ini, kondisi cuaca, kecepatan angin, indeks kualitas udara (AQI), prakiraan suhu maksimum dan minimum hari ini, serta kadar PM2.5 dan PM10.

Data lokasi kota diperoleh melalui layanan geocoding Open-Meteo. Informasi cuaca dan kualitas udara diambil dari layanan Open-Meteo.

## Teknologi

- Expo dan React Native
- TypeScript
- Expo Router
- Open-Meteo Geocoding API, Weather API, dan Air Quality API

## Menjalankan project

Masuk ke folder project, pasang dependensi, lalu mulai server pengembangan:

```bash
npm install
npx expo start
```

Ikuti petunjuk di terminal untuk membuka aplikasi di Expo Go, emulator Android, simulator iOS, atau web.

## Dokumentasi Status Data & Cache

Cache-segar adalah data tersimpan di perangkat yang umurnya masih di bawah batas waktu (TTL) sehingga dianggap valid dan bisa langsung ditampilkan tanpa memerlukan koneksi internet. Cache-basi merupakan data yang sudah melewati batas umur (usang) namun tetap ditampilkan sebagai cadangan saat aplikasi berada dalam mode offline, sedangkan first-run offline adalah kondisi di mana aplikasi dibuka tanpa internet dan belum memiliki data cache sama sekali sehingga hanya menampilkan pesan error. Label status data sangat penting karena memberikan transparansi kepada pengguna mengenai sumber dan kebaruan informasi yang mereka lihat, sehingga mereka tidak mengambil kesimpulan keliru dari data yang mungkin sudah tidak akurat.
