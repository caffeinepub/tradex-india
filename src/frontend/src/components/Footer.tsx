export default function Footer() {
  const year = new Date().getFullYear();
  const utm = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              TradeX India
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Products
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Equities</li>
              <li>F&amp;O</li>
              <li>Mutual Funds</li>
              <li>IPO</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Support
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Help Center</li>
              <li>FAQs</li>
              <li>Grievance</li>
              <li>Reports</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Legal
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Use</li>
              <li>Risk Disclosure</li>
              <li>Disclosures</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            SEBI Registration No: INZ000123456 | NSE Member Code: 12345 | BSE
            Member Code: 67890 | CDSL DP ID: 12345678
          </p>
          <p className="text-xs text-muted-foreground">
            Investments in securities market are subject to market risks. Read
            all the related documents carefully before investing.
          </p>
          <p className="text-xs text-muted-foreground">
            © {year} TradeX India. Built with love using{" "}
            <a
              href={utm}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
