import { useTranslation } from "react-i18next";

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-secondary/40 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h4 className="font-bold mb-3">{t("footer.about")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>{t("footer.contact")}</li>
            <li>{t("footer.terms")}</li>
            <li>{t("footer.privacy")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("header.sellerPanel")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>{t("header.openShop")}</li>
            <li>{t("sidebar.support")}</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Elzan Shop</h4>
          <p className="text-muted-foreground">Marketplace</p>
        </div>
        <div>
          <h4 className="font-bold mb-3">{t("header.language")}</h4>
          <p className="text-muted-foreground text-xs">AZ · RU · EN</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Elzan Shop — {t("footer.rights")}
      </div>
    </footer>
  );
}
