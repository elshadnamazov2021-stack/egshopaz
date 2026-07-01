/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as CatalogRouteImport } from './routes/catalog'
import { Route as DiscoverRouteImport } from './routes/discover'
import { Route as ShopsRouteImport } from './routes/shops'
import { Route as ShopIdRouteImport } from './routes/shop.$id'
import { Route as ProductIdRouteImport } from './routes/product.$id'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as PickupPointsRouteImport } from './routes/pickup-points'
import { Route as PromotionsRouteImport } from './routes/promotions'
import { Route as SupportRouteImport } from './routes/support'
import { Route as PrivacyRouteImport } from './routes/privacy'
import { Route as TermsRouteImport } from './routes/terms'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const CatalogRoute = CatalogRouteImport.update({ id: '/catalog', path: '/catalog', getParentRoute: () => rootRouteImport } as any)
const DiscoverRoute = DiscoverRouteImport.update({ id: '/discover', path: '/discover', getParentRoute: () => rootRouteImport } as any)
const ShopsRoute = ShopsRouteImport.update({ id: '/shops', path: '/shops', getParentRoute: () => rootRouteImport } as any)
const ShopIdRoute = ShopIdRouteImport.update({ id: '/shop/$id', path: '/shop/$id', getParentRoute: () => rootRouteImport } as any)
const ProductIdRoute = ProductIdRouteImport.update({ id: '/product/$id', path: '/product/$id', getParentRoute: () => rootRouteImport } as any)
const ContactRoute = ContactRouteImport.update({ id: '/contact', path: '/contact', getParentRoute: () => rootRouteImport } as any)
const PickupPointsRoute = PickupPointsRouteImport.update({ id: '/pickup-points', path: '/pickup-points', getParentRoute: () => rootRouteImport } as any)
const PromotionsRoute = PromotionsRouteImport.update({ id: '/promotions', path: '/promotions', getParentRoute: () => rootRouteImport } as any)
const SupportRoute = SupportRouteImport.update({ id: '/support', path: '/support', getParentRoute: () => rootRouteImport } as any)
const PrivacyRoute = PrivacyRouteImport.update({ id: '/privacy', path: '/privacy', getParentRoute: () => rootRouteImport } as any)
const TermsRoute = TermsRouteImport.update({ id: '/terms', path: '/terms', getParentRoute: () => rootRouteImport } as any)

const rootRouteChildren = {
  IndexRoute,
  CatalogRoute,
  DiscoverRoute,
  ShopsRoute,
  ShopIdRoute,
  ProductIdRoute,
  ContactRoute,
  PickupPointsRoute,
  PromotionsRoute,
  SupportRoute,
  PrivacyRoute,
  TermsRoute,
}

export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)
