# EG Shop — Mobil Tətbiq (Capacitor)

Mobil tətbiq mövcud `https://egshopaz.lovable.app` saytını birbaşa native qabıqda göstərir. Saytda etdiyiniz hər dəyişiklik avtomatik tətbiqdə görünür — yenidən kompilyasiya tələb olunmur.

## Tələblər
- **Android üçün:** Android Studio, JDK 17+
- **iOS üçün:** macOS + Xcode 15+, Apple Developer hesabı ($99/il)
- **Hər ikisi üçün:** Node.js 20+, Bun

## 1) Layihəni GitHub-a göndərin
Lovable redaktorundan layihəni öz GitHub-a "Export to GitHub" edin, sonra lokal kompüterə klonlayın:

```bash
git clone <repo-url>
cd <repo>
bun install
```

## 2) Native platformaları əlavə edin (yalnız bir dəfə)

```bash
# Android
bunx cap add android

# iOS (yalnız macOS-da)
bunx cap add ios
```

## 3) Web build və native sinxronizasiya

```bash
bun run build
bunx cap sync
```

`capacitor.config.ts` faylında `server.url` `https://egshopaz.lovable.app` üçün konfiqurasiya olunub — yəni tətbiq daxili build deyil, canlı saytı göstərir. Sayt yeniləndikcə tətbiq də avtomatik yenilənir.

> Tam offline / App Store relizi üçün `server.url` sətrini silin və `bun run build` + `bunx cap sync` ilə daxili build istifadə edin.

## 4) Tətbiqi işə salın

```bash
# Android emulyator və ya bağlı cihaz
bunx cap run android

# iOS simulyator (yalnız macOS)
bunx cap run ios
```

Və ya Android Studio / Xcode-da açın:
```bash
bunx cap open android
bunx cap open ios
```

## 5) Mağazaya yükləmək

### Google Play ($25 birdəfəlik)
1. Android Studio → **Build → Generate Signed Bundle / APK** → `.aab`
2. https://play.google.com/console — yeni tətbiq → `.aab` yükləyin
3. İlk yoxlama 1–7 gün

### Apple App Store ($99/il)
1. Xcode → **Product → Archive** → **Distribute App**
2. App Store Connect-də metadata, ikonlar, ekran şəkilləri əlavə edin
3. Yoxlama 1–3 gün

## İkon və Splash Screen
`@capacitor/assets` ilə avtomatik generasiya:

```bash
bun add -D @capacitor/assets
# resources/icon.png (1024×1024) və resources/splash.png (2732×2732) qoyun
bunx capacitor-assets generate
```

## Faydalı əmrlər
- `bunx cap sync` — kod / pluginlər dəyişdikdə işə salın
- `bunx cap copy` — yalnız web faylları köçürür (sync-dən sürətli)
- `bunx cap update` — Capacitor versiyasını yeniləyir
