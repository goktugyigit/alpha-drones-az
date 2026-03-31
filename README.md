# Alpha Drones

**[EN](#english) | [TR](#turkish)**

![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![D1 Database](https://img.shields.io/badge/Cloudflare%20D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![R2 Storage](https://img.shields.io/badge/Cloudflare%20R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Cloudflare Turnstile](https://img.shields.io/badge/Cloudflare%20Turnstile-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap 5](https://img.shields.io/badge/Bootstrap%205-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![Google Analytics](https://img.shields.io/badge/Google%20Analytics-E37400?style=for-the-badge&logo=googleanalytics&logoColor=white)

---

<a id="english"></a>

## English

Full-service drone technology company website built for [alphadrones.az](https://alphadrones.az). A multilingual, serverless web application deployed on Cloudflare Pages.

### Overview

Alpha Drones is a production-grade, multilingual website for a drone services company operating in Azerbaijan. The project covers everything from a responsive landing page with scroll animations to a secure admin dashboard with JWT authentication. All running serverless on Cloudflare's edge network.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Hosting** | Cloudflare Pages (static + serverless) |
| **Backend** | Cloudflare Workers (Functions) |
| **Database** | Cloudflare D1 (SQLite at the edge) |
| **Storage** | Cloudflare R2 (images & media assets) |
| **Frontend** | Bootstrap 5.3, AOS.js, custom CSS/JS |
| **Auth** | JWT (HS256) with rate limiting |
| **Bot Protection** | Cloudflare Turnstile |
| **Typography** | Custom Rustica font family (19 weights) |
| **Analytics** | Google Analytics 4 |

### Features

**Multilingual (4 Languages)**
Fully translated into Azerbaijani, English, Turkish, and Russian with SEO-optimized `hreflang` tags, Open Graph meta for each locale, and a dynamic language switcher.

**8 Service Pages**
Each service has a dedicated detail page across all 4 languages:
- Facade & Window Cleaning
- Mapping & Land Surveying
- Building & Facility Inspection
- 3D Modeling / Digital Twin
- Plant Health & Yield Forecasting
- Agricultural Spraying
- Visual & Thermal Patrolling
- Confined Space Inspection

**Dynamic Contact Form**
- Service-specific fields that appear based on selected service
- Real-time client-side validation (name, email, phone, message)
- Character counter, field-level error messages
- Turnstile CAPTCHA verification
- Server-side validation with field length limits
- Submissions stored in Cloudflare D1

**Admin Dashboard**
- Password-protected with JWT authentication (24h token expiry)
- Rate limiting: 5 failed login attempts per IP / 15 minutes
- Turnstile protection on login
- View, search, filter, sort, and delete form submissions
- Pagination with configurable page size
- Admin activity logging (login attempts, IP tracking)
- Password change with auto-migration from env to hashed DB storage

**Frontend**
- Scroll-triggered animations (AOS.js)
- Animated stat counters with easing
- Hero section with video background
- Material Design ripple effects on buttons
- Smooth scroll navigation
- Responsive mobile menu with body scroll lock
- Scroll-to-top button
- Toast notification system

**Security**
- All secrets stored in Cloudflare environment variables (zero hardcoded credentials)
- JWT middleware protects all admin API routes
- SHA-256 password hashing stored in D1
- Parameterized SQL queries (no injection vectors)
- CORS with origin validation on admin endpoints
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Admin panel excluded from search engine indexing (`noindex, nofollow`)

**SEO**
- JSON-LD structured data (Organization, LocalBusiness, WebSite)
- Canonical URLs and hreflang alternates on every page
- Open Graph + Twitter Card meta tags
- `sitemap.xml` and `robots.txt`

### Project Structure

```
alphadrones/
├── az/, en/, ru/, tr/         # 4 language versions
│   ├── index.html             # Landing page
│   ├── about.html             # About
│   ├── contact.html           # Contact form
│   ├── technology.html        # Tech specs
│   ├── why-us.html            # Why Alpha Drones
│   └── services/              # 8 service detail pages
├── admin/
│   └── index.html             # Admin dashboard (login + submissions)
├── functions/api/
│   ├── submit.js              # POST /api/submit
│   └── admin/
│       ├── _middleware.js      # JWT verification
│       ├── login.js           # POST /api/admin/login
│       ├── submissions.js     # GET/DELETE /api/admin/submissions
│       └── change-password.js # POST /api/admin/change-password
├── css/styles.css             # Stylesheet
├── js/main.js                 # Client-side logic (~990 lines)
├── FONTS/                     # Rustica font family (19 weights)
├── _headers                   # Security & cache headers
├── _redirects                 # URL redirects
├── schema.sql                 # Submissions DB schema
└── schema-admin.sql           # Admin DB schema
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/submit` | Turnstile | Submit contact form |
| `POST` | `/api/admin/login` | Turnstile | Admin login, returns JWT |
| `GET` | `/api/admin/submissions` | JWT | List/search/filter submissions |
| `DELETE` | `/api/admin/submissions` | JWT | Delete submissions |
| `POST` | `/api/admin/change-password` | JWT | Change admin password |

### Deployment

The site is deployed on **Cloudflare Pages** with Workers Functions for the backend API and two D1 databases for data storage.

```bash
# Install dependencies
npm install wrangler --save-dev

# Local development
npx wrangler pages dev ./

# Deploy
npx wrangler pages deploy ./
```

#### Environment Variables (Cloudflare Dashboard)

| Variable | Purpose |
|----------|---------|
| `ADMIN_PASSWORD` | Initial admin password (auto-migrates to DB hash) |
| `ADMIN_SECRET` | JWT signing secret |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side key |

---

<a id="turkish"></a>

## Türkçe

[alphadrones.az](https://alphadrones.az) için geliştirilmiş, çok dilli, serverless bir web uygulaması. Cloudflare Pages üzerinde deploy edilmiştir.

### Genel Bakış

Alpha Drones, Azerbaycan'da faaliyet gösteren bir drone hizmet şirketi için üretim seviyesinde geliştirilmiş çok dilli bir web sitesidir. Proje, scroll animasyonlu responsive bir landing page'den JWT kimlik doğrulamalı güvenli bir admin paneline kadar her şeyi kapsar. Tamamı Cloudflare'in edge ağında serverless olarak çalışır.

### Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Hosting** | Cloudflare Pages (statik + serverless) |
| **Backend** | Cloudflare Workers (Functions) |
| **Veritabanı** | Cloudflare D1 (edge'de SQLite) |
| **Depolama** | Cloudflare R2 (görsel ve medya dosyaları) |
| **Frontend** | Bootstrap 5.3, AOS.js, özel CSS/JS |
| **Kimlik Doğrulama** | JWT (HS256) + hız sınırlandırma |
| **Bot Koruması** | Cloudflare Turnstile |
| **Tipografi** | Özel Rustica font ailesi (19 kalınlık) |
| **Analitik** | Google Analytics 4 |

### Özellikler

**Çok Dilli Destek (4 Dil)**
Azerbaycanca, İngilizce, Türkçe ve Rusça'ya tam çevirisi yapılmış; SEO uyumlu `hreflang` etiketleri, her dil için Open Graph meta verileri ve dinamik dil değiştirici içerir.

**8 Hizmet Sayfası**
Her hizmetin 4 dilde ayrı detay sayfası bulunur:
- Cephe ve Cam Temizliği
- Haritalama ve Arazi Ölçümü
- Bina ve Tesis Denetimi
- 3D Modelleme / Dijital İkiz
- Bitki Sağlığı ve Verim Tahmini
- Tarımsal İlaçlama
- Görsel ve Termal Devriye
- Kapalı Alan Denetimi

**Dinamik İletişim Formu**
- Seçilen hizmete göre otomatik beliren özel alanlar
- Gerçek zamanlı istemci tarafı doğrulama (isim, e-posta, telefon, mesaj)
- Karakter sayacı, alan bazlı hata mesajları
- Turnstile CAPTCHA doğrulaması
- Sunucu tarafı doğrulama ve alan uzunluk sınırları
- Gönderimler Cloudflare D1'de saklanır

**Admin Paneli**
- JWT kimlik doğrulamalı şifre koruması (24 saat token süresi)
- Hız sınırlandırma: IP başına 15 dakikada 5 başarısız giriş
- Giriş ekranında Turnstile koruması
- Form gönderimlerini görüntüleme, arama, filtreleme, sıralama ve silme
- Yapılandırılabilir sayfa boyutuyla sayfalama
- Admin aktivite kaydı (giriş denemeleri, IP takibi)
- Ortam değişkeninden hashli veritabanı depolamasına otomatik şifre göçü

**Frontend**
- Scroll tetiklemeli animasyonlar (AOS.js)
- Hızlandırmalı animasyonlu istatistik sayaçları
- Video arka planlı hero bölümü
- Butonlarda Material Design dalga efekti
- Yumuşak sayfa içi kaydırma
- Body scroll kilidi ile responsive mobil menü
- Yukarı çıkın butonu
- Toast bildirim sistemi

**Güvenlik**
- Tüm hassas bilgiler Cloudflare ortam değişkenlerinde (kodda sıfır hardcoded kimlik bilgisi)
- JWT middleware tüm admin API rotalarını korur
- SHA-256 şifre hashleme, D1'de saklanır
- Parametreli SQL sorguları (enjeksiyon riski yok)
- Admin endpointlerinde origin doğrulamalı CORS
- Güvenlik başlıkları: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- Admin paneli arama motoru indekslemesinden hariç (`noindex, nofollow`)

**SEO**
- JSON-LD yapısal veri (Organization, LocalBusiness, WebSite)
- Her sayfada canonical URL ve hreflang alternatifleri
- Open Graph + Twitter Card meta etiketleri
- `sitemap.xml` ve `robots.txt`

### Proje Yapısı

```
alphadrones/
├── az/, en/, ru/, tr/         # 4 dil versiyonu
│   ├── index.html             # Ana sayfa
│   ├── about.html             # Hakkımızda
│   ├── contact.html           # İletişim formu
│   ├── technology.html        # Teknoloji detayları
│   ├── why-us.html            # Neden Alpha Drones
│   └── services/              # 8 hizmet detay sayfası
├── admin/
│   └── index.html             # Admin paneli (giriş + gönderimler)
├── functions/api/
│   ├── submit.js              # POST /api/submit
│   └── admin/
│       ├── _middleware.js      # JWT doğrulama
│       ├── login.js           # POST /api/admin/login
│       ├── submissions.js     # GET/DELETE /api/admin/submissions
│       └── change-password.js # POST /api/admin/change-password
├── css/styles.css             # Stil dosyası
├── js/main.js                 # İstemci tarafı mantığı (~990 satır)
├── FONTS/                     # Rustica font ailesi (19 kalınlık)
├── _headers                   # Güvenlik ve önbellek başlıkları
├── _redirects                 # URL yönlendirmeleri
├── schema.sql                 # Gönderimler DB şeması
└── schema-admin.sql           # Admin DB şeması
```

### API Endpointleri

| Metod | Endpoint | Yetki | Açıklama |
|-------|----------|-------|----------|
| `POST` | `/api/submit` | Turnstile | İletişim formu gönderimi |
| `POST` | `/api/admin/login` | Turnstile | Admin girişi, JWT döndürür |
| `GET` | `/api/admin/submissions` | JWT | Gönderimleri listele/ara/filtrele |
| `DELETE` | `/api/admin/submissions` | JWT | Gönderimleri sil |
| `POST` | `/api/admin/change-password` | JWT | Admin şifresini değiştir |

### Deployment

Site, backend API için Workers Functions ve veri depolama için iki D1 veritabanı ile **Cloudflare Pages** üzerinde deploy edilmiştir.

```bash
# Bağımlılık kurulumu
npm install wrangler --save-dev

# Yerel geliştirme
npx wrangler pages dev ./

# Deploy
npx wrangler pages deploy ./
```

#### Ortam Değişkenleri (Cloudflare Dashboard)

| Değişken | Amaç |
|----------|------|
| `ADMIN_PASSWORD` | Başlangıç admin şifresi (otomatik olarak DB hash'ine taşınır) |
| `ADMIN_SECRET` | JWT imzalama anahtarı |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile sunucu tarafı anahtarı |

---

## License / Lisans

Copyright © 2026 Bee Pixel LLC. All rights reserved.

This repository is provided for portfolio and evaluation purposes only. No permission is granted to use, copy, modify, distribute, sublicense, or create derivative works from this code without prior written permission from Bee Pixel LLC.

Bu depo yalnızca portfolyo ve değerlendirme amacıyla sunulmaktadır. Bee Pixel LLC'den önceden yazılı izin alınmadan bu kodun kullanılması, kopyalanması, değiştirilmesi, dağıtılması, alt lisanslanması veya türev çalışmalar oluşturulması için herhangi bir izin verilmemektedir.

**Warning / Uyarı:** Unauthorized commercial use of this code may result in legal action. Bu kodun izinsiz ticari amaçla kullanılması hukuki işlem başlatılmasına yol açabilir.
