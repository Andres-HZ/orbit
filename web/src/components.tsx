import { motion } from "framer-motion";
import { Globe2, Home, LogOut, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { useI18n } from "./i18n";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="page-shell">{children}</main>;
}

export function LanguageToggle() {
  const { locale, t, toggleLocale } = useI18n();

  return (
    <button className="language-toggle" onClick={toggleLocale} aria-label={t.nav.language}>
      <Globe2 size={16} aria-hidden="true" />
      <span>{locale.toUpperCase()}</span>
      <strong>{t.nav.switchTo}</strong>
    </button>
  );
}

export function AppShell({
  children,
  onLogout
}: {
  children: ReactNode;
  onLogout: () => void;
}) {
  const { t } = useI18n();

  return (
    <PageShell>
      <nav className="nav">
        <Link to="/home" className="brand">
          <span className="brand-orb" />
          Orbit
        </Link>
        <div className="nav-links">
          <LanguageToggle />
          <Link to="/home" className="nav-link">
            <Home size={16} aria-hidden="true" />
            {t.nav.home}
          </Link>
          <Link to="/profile" className="nav-link">
            <UserRound size={16} aria-hidden="true" />
            {t.nav.profile}
          </Link>
          <button className="link-button" onClick={onLogout}>
            <LogOut size={16} aria-hidden="true" />
            {t.nav.logout}
          </button>
        </div>
      </nav>
      {children}
    </PageShell>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <motion.section className={`card ${className}`}>{children}</motion.section>;
}

export function Button({
  children,
  icon,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode }) {
  return (
    <button className={`button ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function LoadingState({ label = "Loading Orbit..." }: { label?: string }) {
  return (
    <PageShell>
      <Card className="center-card">
        <div className="loader" />
        <p>{label}</p>
      </Card>
    </PageShell>
  );
}

export function EmptyState({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon ?? <Sparkles size={18} aria-hidden="true" />}</span>
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

export function SectionTitle({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <h2 className="section-title">
      {icon}
      {children}
    </h2>
  );
}
