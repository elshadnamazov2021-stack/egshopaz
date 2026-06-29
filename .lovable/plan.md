## Məqsəd
EG Shop-u Wildberries səviyyəsində — bənövşəyi gradient kimliyi ilə, yüksək keyfiyyətli vizual dizayn + bütün işləməyən kliklər/buglar düzəldilmiş halda yenidən qurmaq.

## 1. Vahid dizayn sistemi (bənövşəyi WB-bənzəri)
- `src/styles.css`-də yeni semantik token-lər:
  - `--brand-from: #481173` → `--brand-to: #c026d3` (gradient)
  - `--accent: #7c3aed`, `--discount: #ef4444`, `--success: #22c55e`
  - `--gradient-brand`, `--shadow-elegant`, `--radius-card: 18px`
- Bütün komponentlərdə hardcoded rənglərin token-lərlə əvəzlənməsi
- Font: Manrope (display) + Inter (body) — @fontsource ilə

## 2. Header & axtarış (tək mərkəz)
- Yuxarıda: kateqoriya çubuğu (Wibes, Brendlər, Endirimlər...) gradient zəmin
- Tək axtarış sahəsi (içində kamera/şəkil ikonu) — alt mobil search silinir
- Aşağı tab-bar (mobil): Əsas / Kataloq / Səbət / Sevimlilər / Profil — 5 ikonu, Wildberries kimi yumru

## 3. Məhsul kartı (WB stili)
- Şəkil 3:4 portret, künclər yumru
- Sol-üstdə qırmızı `-XX%` rozetka
- Aşağıda: qiymət (qalın, brend rəng) + köhnə qiymət (üstündən xətt)
- Brend adı / qısa təsvir 2 sətir
- Ulduz + rəylərin sayı
- Tam-en "Səbətə" düyməsi (gradient bənövşəyi)
- Sevimli ürəyi sağ-üst künc
- Avtomatik video preview qalır (səssiz)

## 4. Ana səhifə yenidən
- Sıra: Header → Kateqoriyalar (sürüşən) → Banner (mövcud) → "Endirimdə" / "Yeni gələnlər" / "Trend" zolaqları → Tövsiyələr → Footer
- Hər zolaq: WB kimi 2-sütun mobil grid (carousel deyil) — daha çox məhsul göz önündə

## 5. Bug düzəlişləri (sistematik audit)
Hər səhifəni bir-bir yoxlayıb düzəldəcəyəm:
- **Sidebar**: kənara klik etdikdə bağlansın (overlay click handler)
- **Dil dəyişəndə**: bütün stringlərin az/ru/en JSON-larında tam tərcüməsi (eksik açarları tapıb əlavə etmək)
- **İşləməyən linklər**: bütün `<Link>` və `onClick` audit — qırıq route-lar, boş handler-lər
- **Profil, ünvanlar, ödəniş üsulları, sifarişlər, sevimlilər** — hər səhifə açılış testi
- **Satıcı paneli**: sekme keçidləri, məhsul əlavə, banner ödənişi axını
- **PVZ paneli**: sifariş qəbulu, QR oxuyucu
- **Səbət → ödəniş**: tam axın test (giriş → kart → ödəniş səhifəsi)
- Console error-larını sıfıra endirmək

## 6. Silinəcəklər
- Alt mobil search bar (yuxarıda var)
- "Pulsuz çatdırılma" tipli boş rozetkalar — yalnız real datayla göstər
- Footer-dəki istifadə olunmayan linklər

## 7. Performans & responsiv
- Mobil (320–767), planşet (768–1023), PC (1024+) — hər birində ayrı yoxlama
- Şəkil lazy loading, video yalnız görünəndə avtoplay (artıq var, audit)

## Texniki qeydlər
- Heç bir backend sxem dəyişməsi yoxdur — yalnız frontend + bug fix
- Mövcud route strukturu saxlanılır (TanStack Router)
- Migration yalnız zərurət olarsa (yox kimi)

## Mərhələ sırası (bir mesajda tamamlanmaz, böyük iş)
**Faza 1** (bu turda): Dizayn token-ləri + Header + ProductCard + Ana səhifə + alt tab-bar + sidebar-overlay fix + dil JSON eksikləri
**Faza 2** (növbəti turda): Satıcı paneli + PVZ paneli + ödəniş axını auditi
**Faza 3**: Müştəri profili, sifarişlər, ünvanlar, sevimlilər polish + son bug ovu

Faza 1-i təsdiq etsən, dərhal başlayıram.