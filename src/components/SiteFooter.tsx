export function SiteFooter() {
  return (
    <footer className="bg-secondary/40 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h4 className="font-bold mb-3">Alıcılara</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Necə sifariş etmək olar</li>
            <li>Çatdırılma</li>
            <li>Geri qaytarma</li>
            <li>Tez-tez verilən suallar</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Satıcılara</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Satıcı ol</li>
            <li>Komissiya</li>
            <li>Sənədlər</li>
            <li>Dəstək</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Şirkət</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>Haqqımızda</li>
            <li>Vakansiyalar</li>
            <li>Mətbuat</li>
            <li>Əlaqə</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3">Elzan Shop</h4>
          <p className="text-muted-foreground">Azərbaycanın ən böyük onlayn marketplace platforması.</p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Elzan Shop — Bütün hüquqlar qorunur
      </div>
    </footer>
  );
}
