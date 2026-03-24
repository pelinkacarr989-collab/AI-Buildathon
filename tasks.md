# FoodBridge AI - Geliştirme Görev Listesi

## Proje Özeti
Gıda israfını önleyen, restoranları/marketleri ihtiyaç sahipleriyle buluşturan AI destekli lojistik platform.
Üç kullanıcı rolü: Bağışçı (İşletme), Taşıyıcı (Öğrenci/Gönüllü), Alıcı (Kurum/Barınak).

---

## ADIM 1: Veritabanı Şeması

### T001 - Kullanıcı ve Rol Tabloları
- `users` tablosu: id, name, email, role (donor | carrier | recipient), points, created_at
- `organizations` tablosu: id, user_id, name, address, lat, lng, type (restaurant | market | shelter | ngo)
- Drizzle ORM şemaları + Zod insert şemaları oluşturulacak
- Dosyalar: `lib/db/src/schema/users.ts`, `lib/db/src/schema/organizations.ts`

### T002 - Gıda İlanı ve Teslimat Tabloları
- `food_listings` tablosu: id, donor_org_id, food_type, quantity, unit, category (human | animal), status (open | assigned | delivered | expired), pickup_deadline, created_at
- `deliveries` tablosu: id, listing_id, carrier_id, recipient_org_id, status (pending | accepted | picked_up | delivered), photo_url, completed_at
- Dosyalar: `lib/db/src/schema/food_listings.ts`, `lib/db/src/schema/deliveries.ts`

### T003 - Puan ve Rapor Tabloları
- `point_transactions` tablosu: id, user_id, type (donation | delivery), points, reference_id, created_at
- `monthly_reports` tablosu: id, org_id, month, year, total_food_kg, total_people_fed, report_data (jsonb)
- Dosyalar: `lib/db/src/schema/points.ts`, `lib/db/src/schema/reports.ts`
- Tüm şemaları `lib/db/src/schema/index.ts` üzerinden export et
- Veritabanını push et: `pnpm --filter @workspace/db run push`

---

## ADIM 2: OpenAPI Spec ve Kod Üretimi

### T004 - Auth Endpoint'leri (OpenAPI)
- `POST /auth/register` — Kullanıcı kaydı (role seçimi ile)
- `POST /auth/login` — Giriş (email + password)
- `GET /auth/me` — Mevcut kullanıcı bilgisi
- Dosya: `lib/api-spec/openapi.yaml`

### T005 - Bağışçı (Donor) Endpoint'leri (OpenAPI)
- `POST /donors/listings` — Yeni gıda ilanı oluştur
- `GET /donors/listings` — Bağışçının kendi ilanlarını listele
- `GET /donors/listings/:id` — İlan detayı
- `DELETE /donors/listings/:id` — İlanı iptal et
- `GET /donors/stats` — Toplam bağış istatistikleri
- Dosya: `lib/api-spec/openapi.yaml`

### T006 - AI Kategorizasyon ve Eşleşme Endpoint'leri (OpenAPI)
- `POST /ai/categorize` — Gıda açıklamasını AI ile kategorize et (human | animal)
- `GET /listings/available` — Açık ilanları listele (konum filtresi ile)
- `POST /deliveries` — Kurye teslimat görevi üstlenir
- `PUT /deliveries/:id/status` — Durum güncelle (accepted | picked_up | delivered)
- `POST /deliveries/:id/photo` — Teslimat fotoğrafı yükle
- Dosya: `lib/api-spec/openapi.yaml`

### T007 - Taşıyıcı ve Alıcı Endpoint'leri (OpenAPI)
- `GET /carriers/deliveries` — Kuryenin teslimatlarını listele
- `GET /carriers/leaderboard` — Haftalık/aylık liderlik tablosu
- `GET /recipients/listings` — Alıcıya yönlendirilmiş ilanlar
- `GET /recipients/history` — Geçmiş teslimatlar
- Dosya: `lib/api-spec/openapi.yaml`

### T008 - Rota ve Rapor Endpoint'leri (OpenAPI)
- `GET /routes/optimize` — Bağış noktası + alıcı arası en iyi rota (Mapbox/OSRM)
- `GET /reports/monthly/:orgId` — Aylık etki raporu
- `GET /reports/monthly/:orgId/generate` — AI ile otomatik rapor üret
- `GET /leaderboard` — Genel liderlik tablosu (ayın restoranı, haftanın gönüllüsü)
- Dosya: `lib/api-spec/openapi.yaml`

### T009 - Kod Üretimi (Codegen)
- Tüm OpenAPI spec yazıldıktan sonra codegen çalıştır
- Komut: `pnpm --filter @workspace/api-spec run codegen`
- React Query hook'ları ve Zod şemaları üretilecek
- `lib/api-client-react/src/generated/` ve `lib/api-zod/src/generated/` güncellenir

---

## ADIM 3: Backend Route Handler'ları

### T010 - Auth Route'ları
- Kullanıcı kaydı: bcrypt ile şifre hash, JWT token üret
- Giriş: şifre doğrula, JWT döndür
- Middleware: `src/middlewares/auth.ts` — JWT doğrulama, role kontrolü
- Dosyalar: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/middlewares/auth.ts`

### T011 - Bağışçı Route'ları
- Yeni ilan oluşturma: form verisini Zod ile doğrula, DB'ye yaz
- İlan listeleme ve detay
- İlan iptal etme (sadece bağışçı kendi ilanını silebilir)
- İstatistik: toplam bağış adedi, kg, kurtarılan insan sayısı
- Dosya: `artifacts/api-server/src/routes/donors.ts`

### T012 - AI Kategorizasyon Servisi
- Gıda tipi açıklamasına göre "İnsan Tüketimine Uygun" / "Barınak Hayvanları İçin Uygun" etiketleme
- Replit AI Integrations (OpenAI veya Gemini) kullanarak basit prompt ile kategorizasyon
- Prompt örneği: "Bu gıdayı kategorize et: [açıklama]. Yanıt: 'human' veya 'animal'"
- Dosya: `artifacts/api-server/src/services/ai-categorize.ts`

### T013 - En Yakın Kurye Eşleşme Sistemi
- Açık ilanlar için aktif kuryeler arasından bağışa en yakın olanı bul
- Haversine formülü ile mesafe hesaplama (lat/lng karşılaştırması)
- Kurye uygunsa bildirim kaydı oluştur (notifications tablosu)
- Dosya: `artifacts/api-server/src/services/courier-matching.ts`

### T014 - Teslimat Route'ları
- Kurye teslimat üstlenir (delivery oluştur, listing status = 'assigned')
- Durum güncelleme: picked_up → delivered
- Fotoğraf yükleme (URL kaydetme veya base64)
- Teslimat tamamlandığında puan işlemi tetikle
- Dosya: `artifacts/api-server/src/routes/deliveries.ts`

### T015 - Puan ve Liderlik Tablosu Route'ları
- Teslimat/bağış tamamlandığında point_transactions'a kayıt ekle
- Puan hesaplama: kurye başına +10 puan, bağışçı başına +5 puan
- Haftalık/aylık liderlik tablosu sorgusu (GROUP BY + SUM)
- Dosya: `artifacts/api-server/src/routes/leaderboard.ts`

### T016 - Rota Optimizasyonu Servisi
- Mapbox Directions API veya OSRM (açık kaynak) ile rota hesaplama
- Giriş: bağış noktası koordinatları + alıcı koordinatları
- Çıkış: mesafe, süre, rota polyline GeoJSON
- Bozulma süresi faktörü: pickup_deadline'a göre urgency skoru hesapla
- Dosya: `artifacts/api-server/src/services/route-optimizer.ts`

### T017 - Aylık Rapor Servisi
- AI ile otomatik rapor metni üret: "Bu ay X kg gıdayı kurtardınız, Y canlıyı doyurdunuz"
- Organizasyonun aylık istatistiklerini topla
- Raporu monthly_reports tablosuna kaydet
- Dosya: `artifacts/api-server/src/services/report-generator.ts`

### T018 - Route'ları Express'e Bağla
- Tüm route'ları `artifacts/api-server/src/routes/index.ts` üzerinden mount et
- Auth middleware'i korumalı route'lara uygula
- Hata yönetimi middleware'i ekle (404, 500)
- Dosya: `artifacts/api-server/src/routes/index.ts`

---

## ADIM 4: Frontend (React + Vite)

### T019 - Frontend Artifact Oluşturma
- `react-vite` artifact olarak oluştur
- slug: `foodbridge-web`, previewPath: `/`
- Title: "FoodBridge AI"

### T020 - Kimlik Doğrulama Ekranları
- Giriş sayfası: email + password form
- Kayıt sayfası: name, email, password, rol seçimi (Bağışçı / Taşıyıcı / Alıcı)
- JWT token'ı localStorage'da sakla
- Rol bazlı yönlendirme (dashboard farklı olacak)
- Dosyalar: `artifacts/foodbridge-web/src/pages/Login.tsx`, `Register.tsx`

### T021 - Bağışçı Paneli
- Gıda ilanı oluşturma formu: gıda tipi, miktar, birim, son alınma saati
- AI kategorizasyon: form submit edildiğinde otomatik etiket göster
- Aktif ilanlar listesi: durum badge'leri (Açık / Atandı / Teslim Edildi)
- İstatistik kartları: toplam bağış, kurtarılan kg, doyurulan kişi
- Dosya: `artifacts/foodbridge-web/src/pages/DonorDashboard.tsx`

### T022 - Taşıyıcı (Kurye) Paneli
- Yakındaki açık ilanlar listesi (haritada pinler veya kart listesi)
- Teslimat görevi üstlen butonu
- Aktif teslimatı takip et: Alındı / Teslim Edildi butonları
- Fotoğraf yükleme input'u (teslimat kanıtı)
- Puanım ve sıralamam kartı
- Dosya: `artifacts/foodbridge-web/src/pages/CarrierDashboard.tsx`

### T023 - Alıcı (Kurum) Paneli
- Gelen teslimat ilanları listesi
- Teslimat geçmişi: tarih, miktar, kuryenin adı
- Beklenen teslimatlar (assigned durumunda olanlar)
- Dosya: `artifacts/foodbridge-web/src/pages/RecipientDashboard.tsx`

### T024 - Harita Bileşeni
- Mapbox GL JS veya Leaflet.js kullanarak harita embed et
- Bağış noktaları, alıcılar ve kurye konumunu pin olarak göster
- Rota optimizasyonu sonucunu haritada çiz (polyline)
- Dosya: `artifacts/foodbridge-web/src/components/MapView.tsx`

### T025 - Liderlik Tablosu Sayfası
- "Ayın En Çok Bağış Yapan Restoranı" tablosu
- "Haftanın Gönüllüsü" tablosu
- Puanlara göre sıralı liste, rozet/ikon ile görselleştirme
- Dosya: `artifacts/foodbridge-web/src/pages/Leaderboard.tsx`

### T026 - Aylık Etki Raporu Sayfası
- Grafik: aylık kurtarılan gıda miktarı (bar chart)
- Grafik: doyurulan kişi sayısı (line chart)
- AI tarafından üretilen özet metin kutusu
- PDF veya ekran görüntüsü olarak indir butonu
- Dosya: `artifacts/foodbridge-web/src/pages/MonthlyReport.tsx`

### T027 - Navigasyon ve Layout
- Rol bazlı sidebar/navbar (Bağışçı / Taşıyıcı / Alıcı linkleri farklı)
- Bildirim ikonu (yeni ilan bildirimleri)
- Profil menüsü: puan göstergesi, çıkış butonu
- Dosya: `artifacts/foodbridge-web/src/components/Layout.tsx`

---

## ADIM 5: AI Entegrasyonu

### T028 - Replit AI Integrations Kurulumu
- Replit AI Integrations üzerinden OpenAI veya Gemini API erişimi
- `.local/skills/ai-integrations-openai/SKILL.md` veya `ai-integrations-gemini/SKILL.md` takip et
- API anahtarı gerekmez (Replit proxy üzerinden)

### T029 - AI Kategorizasyon Prompt Mühendisliği
- Gıda tipi açıklamasına göre doğru kategorizasyon prompt'u tasarla
- Örnek: sıcak yemek → human, bozulmuş ürün → animal
- Edge case'ler: belirsiz durumlar için "human" default al
- Yanıt JSON formatında parse et

### T030 - AI Rapor Üretimi Prompt Mühendisliği
- Aylık istatistiklere göre duygusal ve etkili rapor metni üret
- Prompt: "Bu organizasyon için aylık etki raporu yaz: X kg gıda, Y teslimat, Z alıcı..."
- Türkçe ve İngilizce dil desteği (organizasyon diline göre)

---

## ADIM 6: Test ve Entegrasyon

### T031 - Backend API Testi
- Tüm endpoint'leri curl veya Postman ile manuel test et
- Auth akışı: kayıt → giriş → korumalı endpoint erişimi
- Donor akışı: ilan oluştur → AI kategorize → ilan görüntüle
- Carrier akışı: ilan gör → üstlen → teslim et → puan kazan
- API server'ı başlat: `pnpm --filter @workspace/api-server run dev`

### T032 - Frontend-Backend Entegrasyon Testi
- React Query hook'larını gerçek API'ye bağla
- Auth context kurulumu (JWT token yönetimi)
- Rol bazlı route guard'lar (ProtectedRoute component)
- Loading ve error state'lerinin doğru gösterilmesi

### T033 - Veritabanı Seed Data
- Demo veriler: 3 bağışçı organizasyon, 5 kurye, 2 alıcı kurum
- Örnek ilanlar: farklı durumlar (open, assigned, delivered)
- Örnek puanlar ve liderlik tablosu verisi
- Script: `scripts/src/seed.ts`

---

## ADIM 7: Son Düzeltmeler ve Yayın

### T034 - Güvenlik ve Validasyon
- Tüm input'lar Zod ile doğrula (backend)
- SQL injection koruması (Drizzle ORM parametreli sorgular)
- Rate limiting middleware ekle (opsiyonel)
- CORS ayarlarını prodüksiyon için güncelle

### T035 - UI/UX İyileştirmeleri
- Yükleme animasyonları (skeleton, spinner)
- Başarı/hata toast bildirimleri
- Mobil uyumlu tasarım (responsive)
- Renk paleti: yeşil tonları (sürdürülebilirlik teması)

### T036 - Deployment Hazırlığı
- Ortam değişkenleri kontrolü: DATABASE_URL, AI API anahtarları
- Build test: `pnpm run build`
- Prodüksiyon için esbuild bundle oluştur
- Replit üzerinden yayınla (suggest_deploy)

---

## Teknoloji Haritası

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend | Express 5 + TypeScript |
| Veritabanı | PostgreSQL + Drizzle ORM |
| Validasyon | Zod (API + DB) |
| API Sözleşmesi | OpenAPI 3.1 + Orval codegen |
| AI | Replit AI Integrations (OpenAI/Gemini) |
| Harita | Mapbox GL JS veya Leaflet.js |
| Kimlik Doğrulama | JWT (Replit Auth opsiyonel) |
| Puan/Gamification | DB tabanlı point_transactions |

---

## Öncelik Sırası

1. **Kritik (MVP)**: T001–T003, T010–T014, T019–T023 (temel akış)
2. **Önemli**: T004–T009, T015–T018, T024–T027 (tam özellik)
3. **Ekstra**: T028–T030, T031–T036 (AI + polishing)
