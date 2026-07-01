export interface Category {
  id: string;
  name: string;
  name_ru?: string;
  name_en?: string;
  slug: string;
  icon: string;
  parent_id: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  old_price: number | null;
  image_url: string | null;
  images: string[];
  video_url?: string | null;
  rating: number;
  reviews_count: number;
  brand: string | null;
  stock: number;
  seller_id: string;
  category_slug: string;
  free_shipping?: boolean;
  fast_delivery?: boolean;
}

export interface Shop {
  id: string;
  shop_name: string;
  full_name: string;
  shop_logo_url: string | null;
  shop_banner_url: string | null;
  shop_city: string;
  shop_description: string;
  created_at: string;
  seller_tier: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  min_order: number;
  expires_at: string | null;
}

export interface PickupPoint {
  id: string;
  name: string;
  city: string;
  address: string;
  working_hours: string;
  point_number: number;
}

export const categories: Category[] = [
  { id: "c1", name: "Geyim", name_ru: "Одежда", name_en: "Clothing", slug: "geyim", icon: "👗", parent_id: null, sort_order: 1 },
  { id: "c2", name: "Ayaqqabı", name_ru: "Обувь", name_en: "Shoes", slug: "ayaqqabi", icon: "👟", parent_id: null, sort_order: 2 },
  { id: "c3", name: "Elektronika", name_ru: "Электроника", name_en: "Electronics", slug: "elektronika", icon: "📱", parent_id: null, sort_order: 3 },
  { id: "c4", name: "Ev və dekor", name_ru: "Дом и декор", name_en: "Home & decor", slug: "ev-dekor", icon: "🏠", parent_id: null, sort_order: 4 },
  { id: "c5", name: "Gözəllik", name_ru: "Красота", name_en: "Beauty", slug: "gozellik", icon: "💄", parent_id: null, sort_order: 5 },
  { id: "c6", name: "Uşaq və körpə", name_ru: "Детям", name_en: "Kids", slug: "usaq-korpe", icon: "🧸", parent_id: null, sort_order: 6 },
  { id: "c7", name: "Supermarket", name_ru: "Супермаркет", name_en: "Supermarket", slug: "supermarket", icon: "🛒", parent_id: null, sort_order: 7 },
  { id: "c8", name: "İdman", name_ru: "Спорт", name_en: "Sport", slug: "idman", icon: "🏋️", parent_id: null, sort_order: 8 },
  { id: "c9", name: "Avto", name_ru: "Авто", name_en: "Auto", slug: "avto", icon: "🚗", parent_id: null, sort_order: 9 },
  { id: "c10", name: "Kitab və ofis", name_ru: "Книги и офис", name_en: "Books & office", slug: "kitab-ofis", icon: "📚", parent_id: null, sort_order: 10 },
  { id: "c1-1", name: "Qadın geyimi", name_ru: "Женская одежда", name_en: "Women", slug: "qadin-geyimi", icon: "👚", parent_id: "c1", sort_order: 11 },
  { id: "c1-2", name: "Kişi geyimi", name_ru: "Мужская одежда", name_en: "Men", slug: "kisi-geyimi", icon: "👕", parent_id: "c1", sort_order: 12 },
  { id: "c2-1", name: "Sneakers", name_ru: "Кроссовки", name_en: "Sneakers", slug: "sneakers", icon: "👟", parent_id: "c2", sort_order: 13 },
  { id: "c3-1", name: "Telefonlar", name_ru: "Телефоны", name_en: "Phones", slug: "telefonlar", icon: "📱", parent_id: "c3", sort_order: 14 },
  { id: "c3-2", name: "Aksesuarlar", name_ru: "Аксессуары", name_en: "Accessories", slug: "aksesuarlar", icon: "🎧", parent_id: "c3", sort_order: 15 },
  { id: "c4-1", name: "Mətbəx", name_ru: "Кухня", name_en: "Kitchen", slug: "metbex", icon: "🍳", parent_id: "c4", sort_order: 16 },
  { id: "c5-1", name: "Dəri baxımı", name_ru: "Уход за кожей", name_en: "Skincare", slug: "deri-baximi", icon: "🧴", parent_id: "c5", sort_order: 17 },
  { id: "c6-1", name: "Oyuncaqlar", name_ru: "Игрушки", name_en: "Toys", slug: "oyuncaqlar", icon: "🧸", parent_id: "c6", sort_order: 18 },
  { id: "c7-1", name: "Şirniyyat", name_ru: "Сладости", name_en: "Sweets", slug: "sirniyyat", icon: "🍫", parent_id: "c7", sort_order: 19 },
  { id: "c8-1", name: "Fitness", name_ru: "Фитнес", name_en: "Fitness", slug: "fitness", icon: "🏃", parent_id: "c8", sort_order: 20 },
];

export const shops: Shop[] = [
  { id: "s1", shop_name: "Baku Fashion", full_name: "Baku Fashion", shop_city: "Bakı", shop_logo_url: null, shop_banner_url: null, shop_description: "Gündəlik geyim və aksessuarlar üçün statik vitrin mağazası.", created_at: "2025-01-12", seller_tier: "gold" },
  { id: "s2", shop_name: "Techno AZ", full_name: "Techno AZ", shop_city: "Bakı", shop_logo_url: null, shop_banner_url: null, shop_description: "Telefon, qulaqcıq və elektronika nümunələri.", created_at: "2025-03-05", seller_tier: "silver" },
  { id: "s3", shop_name: "HomeLand", full_name: "HomeLand", shop_city: "Gəncə", shop_logo_url: null, shop_banner_url: null, shop_description: "Ev, dekor və mətbəx məhsulları.", created_at: "2025-05-18", seller_tier: "bronze" },
];

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const products: Product[] = [
  { id: "p1", title: "Qadın yay donu", description: "Yüngül parça, gündəlik istifadə üçün rahat model.", price: 39.9, old_price: 59.9, image_url: img("photo-1515372039744-b8f02a3ae446"), images: [img("photo-1515372039744-b8f02a3ae446"), img("photo-1496747611176-843222e1e57c")], rating: 4.8, reviews_count: 124, brand: "Baku Fashion", stock: 25, seller_id: "s1", category_slug: "qadin-geyimi", free_shipping: true, fast_delivery: true },
  { id: "p2", title: "Kişi basic köynək", description: "Pambıq material, klassik kəsim.", price: 24.5, old_price: 34.9, image_url: img("photo-1521572163474-6864f9cf17ab"), images: [img("photo-1521572163474-6864f9cf17ab")], rating: 4.6, reviews_count: 88, brand: "Baku Fashion", stock: 40, seller_id: "s1", category_slug: "kisi-geyimi" },
  { id: "p3", title: "Smartfon 128GB", description: "Böyük ekran, sürətli enerji yığımı, 128GB yaddaş.", price: 499, old_price: 549, image_url: img("photo-1511707171634-5f897ff02aa9"), images: [img("photo-1511707171634-5f897ff02aa9")], rating: 4.7, reviews_count: 210, brand: "Techno AZ", stock: 12, seller_id: "s2", category_slug: "telefonlar", fast_delivery: true },
  { id: "p4", title: "Bluetooth qulaqcıq", description: "Səssiz iş rejimi, rahat oturuş, uzun batareya.", price: 59, old_price: 79, image_url: img("photo-1505740420928-5e560c06d30e"), images: [img("photo-1505740420928-5e560c06d30e")], rating: 4.5, reviews_count: 67, brand: "Techno AZ", stock: 30, seller_id: "s2", category_slug: "aksesuarlar" },
  { id: "p5", title: "Mətbəx qab dəsti", description: "Gündəlik mətbəx istifadəsi üçün 12 hissəli dəst.", price: 89, old_price: 119, image_url: img("photo-1556911220-bff31c812dba"), images: [img("photo-1556911220-bff31c812dba")], rating: 4.9, reviews_count: 51, brand: "HomeLand", stock: 18, seller_id: "s3", category_slug: "metbex", free_shipping: true },
  { id: "p6", title: "Dəri baxım kremi", description: "Gündəlik nəmləndirici krem nümunəsi.", price: 18.9, old_price: null, image_url: img("photo-1556228578-8c89e6adf883"), images: [img("photo-1556228578-8c89e6adf883")], rating: 4.4, reviews_count: 43, brand: "Glow", stock: 55, seller_id: "s1", category_slug: "deri-baximi" },
  { id: "p7", title: "Uşaq oyuncaq maşını", description: "Təhlükəsiz plastik materialdan oyuncaq.", price: 14.9, old_price: 19.9, image_url: img("photo-1596461404969-9ae70f2830c1"), images: [img("photo-1596461404969-9ae70f2830c1")], rating: 4.3, reviews_count: 39, brand: "Kids", stock: 70, seller_id: "s3", category_slug: "oyuncaqlar" },
  { id: "p8", title: "Fitness rezin dəsti", description: "Ev məşqləri üçün müqavimət rezinləri.", price: 22, old_price: 29, image_url: img("photo-1518611012118-696072aa579a"), images: [img("photo-1518611012118-696072aa579a")], rating: 4.6, reviews_count: 58, brand: "Fit", stock: 34, seller_id: "s2", category_slug: "fitness" },
  { id: "p9", title: "Sneakers ağ model", description: "Gündəlik istifadə üçün rahat idman ayaqqabısı.", price: 69, old_price: 99, image_url: img("photo-1549298916-b41d501d3772"), images: [img("photo-1549298916-b41d501d3772")], rating: 4.8, reviews_count: 112, brand: "Urban", stock: 21, seller_id: "s1", category_slug: "sneakers" },
  { id: "p10", title: "Premium şokolad qutusu", description: "Hədiyyəlik şokolad kolleksiyası.", price: 16.5, old_price: null, image_url: img("photo-1549007994-cb92caebd54b"), images: [img("photo-1549007994-cb92caebd54b")], rating: 4.9, reviews_count: 73, brand: "Sweet", stock: 90, seller_id: "s3", category_slug: "sirniyyat" },
];

export const promoCodes: PromoCode[] = [
  { id: "promo1", code: "EG10", discount_percent: 10, discount_amount: null, min_order: 50, expires_at: "2026-12-31" },
  { id: "promo2", code: "MARKET5", discount_percent: null, discount_amount: 5, min_order: 35, expires_at: "2026-12-31" },
  { id: "promo3", code: "YENI20", discount_percent: 20, discount_amount: null, min_order: 100, expires_at: "2026-12-31" },
];

export const pickupPoints: PickupPoint[] = [
  { id: "pvz1", point_number: 1, name: "EG PVZ Mərkəz", city: "Bakı", address: "Nizami küçəsi 10", working_hours: "10:00 - 20:00" },
  { id: "pvz2", point_number: 2, name: "EG PVZ Gəncə", city: "Gəncə", address: "Heydər Əliyev prospekti 24", working_hours: "10:00 - 19:00" },
  { id: "pvz3", point_number: 3, name: "EG PVZ Sumqayıt", city: "Sumqayıt", address: "Sülh küçəsi 7", working_hours: "10:00 - 19:00" },
];

export const getCategory = (slug?: string | null) => categories.find((c) => c.slug === slug);
export const getProduct = (id: string) => products.find((p) => p.id === id);
export const getShop = (id: string) => shops.find((s) => s.id === id);
export const getShopProducts = (sellerId: string) => products.filter((p) => p.seller_id === sellerId);
export const childCategories = (parentId: string | null) => categories.filter((c) => c.parent_id === parentId).sort((a, b) => a.sort_order - b.sort_order);

export function categorySlugsWithChildren(slug?: string | null): string[] | null {
  if (!slug) return null;
  const root = getCategory(slug);
  if (!root) return [slug];
  const ids = new Set([root.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const cat of categories) {
      if (cat.parent_id && ids.has(cat.parent_id) && !ids.has(cat.id)) {
        ids.add(cat.id);
        changed = true;
      }
    }
  }
  return categories.filter((c) => ids.has(c.id)).map((c) => c.slug);
}
