# Eco Core Dashboard

Bu proje, sürdürülebilir enerji yönetimi için geliştirilmiş bir React uygulamasıdır.

## Kurulum

Projeyi çalıştırmak için aşağıdaki adımları takip edin:

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Kurulum Adımları

1. Proje dizinine gidin:
```bash
cd eco-core-dashboard
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm start
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılacaktır.

## Render'da Deploy Etme

Bu React uygulamasını Render'da deploy etmek için:

### 1. GitHub'a Push Edin
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/kullaniciadi/repo-adi.git
git push -u origin main
```

### 2. Render'da Yeni Site Oluşturun
1. [Render Dashboard](https://dashboard.render.com)'a gidin
2. "New +" butonuna tıklayın
3. "Static Site" seçin
4. GitHub repository'nizi bağlayın
5. Aşağıdaki ayarları yapın:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment**: Production

### 3. Environment Variables (Gerekirse)
Eğer environment variables kullanıyorsanız, Render dashboard'da ekleyebilirsiniz.

## Kullanılabilir Scriptler

- `npm start` - Geliştirme sunucusunu başlatır
- `npm test` - Testleri çalıştırır
- `npm run build` - Production build oluşturur
- `npm run serve` - Production build'i serve eder
- `npm run eject` - Create React App yapılandırmasını dışa aktarır

## Proje Yapısı

```
eco-core-dashboard/
├── public/                 # Statik dosyalar
│   ├── index.html         # Ana HTML dosyası
│   ├── manifest.json      # Web app manifest
│   └── robots.txt         # SEO için robots dosyası
├── src/                   # Kaynak kodlar
│   ├── App.js            # Ana uygulama bileşeni
│   ├── App.css           # Ana uygulama stilleri
│   ├── index.js          # Uygulama giriş noktası
│   └── index.css         # Global stiller
├── package.json          # Proje bağımlılıkları
└── README.md             # Bu dosya
```

## Teknolojiler

- React 18
- Create React App
- CSS3
- Jest (Test framework) 