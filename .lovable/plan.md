## Problem
PC-də (geniş ekran) satıcı panelinə girəndə sol menyu yalnız "Dashboard" göstərir, qalan bəndlər görünmür.

## Səbəb
`src/components/PanelLayout.tsx`-də nav `panel-scroll-row` sinfindən istifadə edir. Bu sinif `src/styles.css`-də `display: flex; overflow-x: auto` təyin edir və media query ilə məhdudlaşdırılmayıb. Tailwind-in `lg:block` utility-si CSS yükləmə sırasına görə bu qaydanı üstələyə bilmir, ona görə də lg breakpoint-də nav hələ də üfüqi flex sırası kimi qalır — 260px-lik aside içində birinci bənd (Dashboard) görsənir, qalanları gizli scroll arxasında qalır.

## Həll
`src/styles.css`-də `.panel-scroll-row` qaydasına `lg` (≥1024px) media query əlavə etmək ki, böyük ekranda avtomatik şaquli sıraya keçsin:

```css
@media (min-width: 1024px) {
  .panel-scroll-row {
    display: block;
    overflow: visible;
    gap: 0;
  }
  .panel-scroll-row > * {
    flex-shrink: initial;
  }
}
```

Beləliklə mobil/planşetdə üfüqi sürüşdürmə qalır, PC-də isə bütün menyu bəndləri şaquli görünür. `PanelLayout.tsx`-də heç bir dəyişiklik lazım deyil.
