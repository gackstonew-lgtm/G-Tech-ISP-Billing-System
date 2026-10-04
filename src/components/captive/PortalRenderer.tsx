"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Ticket,
  Phone,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Mail,
  MessageCircle,
  Megaphone,
  Info,
  Star,
  X,
} from "lucide-react";
import {
  FONT_SCALE_FACTOR,
  FONT_STACKS,
  RADIUS_SCALE,
  SPACING_PX,
  mixColors,
  presentPackages,
  resolvePalette,
  type PlanLike,
  type PortalConfig,
  type PortalPalette,
} from "@/lib/captive/config";

/**
 * Reusable, template-driven captive portal renderer.
 *
 * ONE component renders every template — a template is only a preset of the
 * controlled values in PortalConfig. It is used by:
 *   - the live public portal  (mode="live")
 *   - the customizer preview   (mode="preview": no network calls)
 *
 * Layout adapts to ITS OWN width (not the browser's), so the desktop/tablet/
 * mobile preview frames behave exactly like real devices.
 */

export type PortalMode = "live" | "preview";

interface PortalRendererProps {
  config: PortalConfig;
  plans: PlanLike[];
  mode: PortalMode;
  /** Which login methods the backend supports (public API supplies this). */
  supportedMethods?: string[];
  className?: string;
}

type Tab = "MPESA" | "VOUCHER";
interface Status {
  kind: "success" | "error" | "info";
  text: string;
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(Math.round(e.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

function useSystemDark(enabled: boolean) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [enabled]);
  return dark;
}

function cssUrl(u: string): string {
  return `url("${encodeURI(u).replace(/["()'\\]/g, (c) => encodeURIComponent(c))}")`;
}

function formatMoney(amount: number, currency: string): string {
  const sym = currency === "KES" ? "KES" : currency;
  return `${sym} ${Number.isInteger(amount) ? amount.toLocaleString("en-KE") : amount.toFixed(2)}`;
}

function buildBackground(config: PortalConfig, p: PortalPalette): React.CSSProperties {
  const { background } = config.ui;
  const img = config.branding.backgroundImageUrl;
  if (background === "image" && img) {
    return {
      backgroundColor: p.bg,
      backgroundImage: `linear-gradient(${p.dark ? "rgba(8,12,18,0.72)" : "rgba(255,255,255,0.55)"}, ${p.dark ? "rgba(8,12,18,0.72)" : "rgba(255,255,255,0.55)"}), ${cssUrl(img)}`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (background === "gradient" || background === "image") {
    return {
      backgroundImage: `linear-gradient(135deg, ${mixColors(p.bg, p.primary, p.dark ? 0.28 : 0.16)} 0%, ${p.bg} 55%, ${mixColors(p.bg, p.accent, p.dark ? 0.22 : 0.14)} 100%)`,
      backgroundColor: p.bg,
    };
  }
  if (background === "pattern") {
    return {
      backgroundColor: p.bg,
      backgroundImage: `radial-gradient(${mixColors(p.bg, p.primary, 0.22)} 1.2px, transparent 1.2px)`,
      backgroundSize: "18px 18px",
    };
  }
  return { backgroundColor: p.bg };
}

export function PortalRenderer({ config, plans, mode, supportedMethods, className }: PortalRendererProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const systemDark = useSystemDark(config.ui.colorMode === "auto");
  const pal = useMemo(() => resolvePalette(config, systemDark), [config, systemDark]);
  const radius = RADIUS_SCALE[config.ui.radius];
  const scale = FONT_SCALE_FACTOR[config.ui.fontScale];
  const pad = SPACING_PX[config.ui.spacing];
  const fs = (px: number) => Math.round(px * scale * 10) / 10;
  const uid = useId();

  const compact = width > 0 && width < 560;
  const wide = width >= 900;

  const packages = useMemo(() => presentPackages(plans, config), [plans, config]);

  const methodAllowed = (id: string) => !supportedMethods || supportedMethods.includes(id);
  const mpesaOn = config.authMethods.mpesa && methodAllowed("mpesa");
  const voucherOn = config.authMethods.voucher && methodAllowed("voucher");
  const bothOn = mpesaOn && voucherOn;

  const [tab, setTab] = useState<Tab>(mpesaOn ? "MPESA" : "VOUCHER");
  useEffect(() => {
    if (tab === "MPESA" && !mpesaOn && voucherOn) setTab("VOUCHER");
    if (tab === "VOUCHER" && !voucherOn && mpesaOn) setTab("MPESA");
  }, [mpesaOn, voucherOn, tab]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = packages.find((p) => p.id === selectedId) ?? packages[0] ?? null;

  const [phone, setPhone] = useState("");
  const [voucher, setVoucher] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);

  const msgs = config.messages;

  // ----- actions (live: existing flows; preview: local only, no network) -----
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!/^(?:\+?254|0)?[17]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) {
      setStatus({ kind: "error", text: "Enter a valid M-Pesa number, e.g. 0712345678." });
      return;
    }
    setBusy(true);
    setStatus({ kind: "info", text: config.payment.instructions || "Check your phone for the M-Pesa prompt." });
    if (mode === "preview") {
      setTimeout(() => {
        setStatus({ kind: "success", text: config.payment.confirmation || msgs.paymentSuccess });
        setBusy(false);
      }, 900);
      return;
    }
    try {
      const { MpesaService } = await import("@/lib/payments/mpesa");
      const res = await MpesaService.initiateSTKPush({
        phoneNumber: phone,
        amount: selected.price,
        accountReference: `HS-${selected.name.substring(0, 4)}`,
        transactionDesc: `Hotspot ${selected.name}`,
      });
      if (res.success) {
        setTimeout(() => {
          setStatus({ kind: "success", text: config.payment.confirmation || msgs.paymentSuccess });
          setBusy(false);
        }, 2000);
      } else {
        setStatus({ kind: "error", text: msgs.paymentFailed });
        setBusy(false);
      }
    } catch {
      setStatus({ kind: "error", text: msgs.paymentFailed });
      setBusy(false);
    }
  };

  const handleVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const code = voucher.trim();
    if (!/^[A-Z0-9-]{6,24}$/.test(code)) {
      setStatus({ kind: "error", text: msgs.voucherInvalid });
      return;
    }
    setBusy(true);
    setStatus({ kind: "info", text: "Checking your voucher…" });
    setTimeout(() => {
      setStatus({ kind: "success", text: msgs.loginSuccess });
      setBusy(false);
    }, 1000);
  };

  // ----- styles -----
  const inputStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 44,
    padding: "10px 12px",
    fontSize: fs(14),
    color: pal.text,
    background: pal.surfaceAlt,
    border: `1px solid ${pal.border}`,
    borderRadius: radius.control,
    fontFamily: "inherit",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 46,
    padding: "10px 16px",
    fontSize: fs(14),
    fontWeight: 700,
    borderRadius: radius.button,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: busy ? "wait" : "pointer",
    opacity: busy ? 0.8 : 1,
    fontFamily: "inherit",
    ...(config.ui.buttonStyle === "solid"
      ? { background: pal.primary, color: pal.primaryText, border: `2px solid ${pal.primary}` }
      : config.ui.buttonStyle === "outline"
        ? { background: "transparent", color: pal.primaryOnSurface, border: `2px solid ${pal.primary}` }
        : { background: mixColors(pal.surface, pal.primary, 0.14), color: pal.primaryOnSurface, border: `2px solid transparent` }),
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: fs(11),
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: pal.muted,
    marginBottom: 6,
  };

  const cardStyle: React.CSSProperties = {
    background: pal.surface,
    border: `1px solid ${pal.border}`,
    borderRadius: radius.card,
    padding: compact ? Math.max(14, pad - 4) : pad + 4,
    boxShadow: pal.dark ? "0 8px 30px rgba(0,0,0,0.35)" : "0 8px 30px rgba(16,24,40,0.08)",
    width: "100%",
  };

  const justify = (pos: "left" | "center" | "right") =>
    pos === "left" ? "flex-start" : pos === "right" ? "flex-end" : "center";

  // ----- pieces -----
  const logo = config.branding.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={config.branding.logoUrl}
      alt={config.branding.businessName}
      decoding="async"
      style={{ maxHeight: compact ? 44 : 56, maxWidth: "70%", objectFit: "contain" }}
    />
  ) : (
    <span style={{ fontSize: fs(20), fontWeight: 800, color: pal.text, letterSpacing: "-0.01em" }}>
      {config.branding.businessName}
    </span>
  );

  const { banner, announcement, featuredOffer, adImage, sponsored } = config.promotions;
  const safeLink = (href: string, children: React.ReactNode, style?: React.CSSProperties) => (
    <a href={href} target="_blank" rel="noopener noreferrer sponsored" style={style}>
      {children}
    </a>
  );

  const message = status && (
    <div
      role={status.kind === "error" ? "alert" : "status"}
      aria-live="polite"
      style={{
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        padding: "10px 12px",
        borderRadius: radius.control,
        fontSize: fs(12.5),
        fontWeight: 600,
        lineHeight: 1.4,
        color: status.kind === "error" ? pal.danger : status.kind === "success" ? pal.success : pal.text,
        background: mixColors(pal.surface, status.kind === "error" ? pal.danger : status.kind === "success" ? pal.success : pal.primary, 0.12),
        border: `1px solid ${mixColors(pal.surface, status.kind === "error" ? pal.danger : status.kind === "success" ? pal.success : pal.primary, 0.35)}`,
        overflowWrap: "anywhere",
      }}
    >
      {status.kind === "error" ? <AlertCircle size={16} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} /> : status.kind === "success" ? <CheckCircle2 size={16} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} /> : <Info size={16} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />}
      <span>{status.text}</span>
    </div>
  );

  const mpesaForm = (
    <form onSubmit={handlePay} style={{ display: "flex", flexDirection: "column", gap: 14 }} noValidate>
      <div>
        <span style={labelStyle} id={`${uid}-pk`}>1. Select a package</span>
        {packages.length === 0 ? (
          <p style={{ fontSize: fs(13), color: pal.muted }}>No packages are available right now.</p>
        ) : (
          <div
            role="radiogroup"
            aria-labelledby={`${uid}-pk`}
            style={{
              display: "grid",
              gap: 10,
              gridTemplateColumns: config.packages.layout === "grid" && !compact ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
            }}
          >
            {packages.map((p) => {
              const on = selected?.id === p.id;
              const meta = [
                config.packages.showSpeed && p.speedLabel,
                config.packages.showDuration && p.durationLabel,
                config.packages.showData && p.dataLabel,
              ].filter(Boolean);
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    textAlign: "left",
                    padding: 12,
                    minHeight: 44,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: pal.text,
                    background: on ? mixColors(pal.surface, pal.primary, 0.1) : pal.surface,
                    border: `2px solid ${on ? pal.primary : pal.border}`,
                    borderRadius: radius.control + 2,
                    position: "relative",
                    minWidth: 0,
                    overflowWrap: "anywhere",
                  }}
                >
                  {p.featured && (
                    <span
                      style={{
                        position: "absolute",
                        top: -9,
                        right: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: fs(10),
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 9999,
                        background: pal.accent,
                        color: pal.accentText,
                      }}
                    >
                      <Star size={10} aria-hidden /> Featured
                    </span>
                  )}
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: fs(13.5), fontWeight: 700 }}>{p.name}</span>
                    {on && <CheckCircle2 size={15} aria-hidden color={pal.primaryOnSurface} style={{ flexShrink: 0 }} />}
                  </span>
                  <span style={{ display: "block", marginTop: 4, fontSize: fs(17), fontWeight: 800, color: pal.primaryOnSurface }}>
                    {formatMoney(p.price, p.currency)}
                  </span>
                  {meta.length > 0 && (
                    <span style={{ display: "block", marginTop: 2, fontSize: fs(11.5), color: pal.muted, fontWeight: 600 }}>
                      {meta.join(" • ")}
                    </span>
                  )}
                  {p.description && (
                    <span style={{ display: "block", marginTop: 4, fontSize: fs(11.5), color: pal.muted }}>{p.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-phone`} style={labelStyle}>2. M-Pesa phone number</label>
        <div style={{ position: "relative" }}>
          <Phone size={16} aria-hidden color={pal.muted} style={{ position: "absolute", left: 12, top: 14 }} />
          <input
            id={`${uid}-phone`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 36, fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontWeight: 700 }}
          />
        </div>
        {config.payment.instructions && (
          <p style={{ marginTop: 6, fontSize: fs(11.5), color: pal.muted, overflowWrap: "anywhere" }}>{config.payment.instructions}</p>
        )}
      </div>

      {message}

      <button type="submit" disabled={busy || !selected} style={buttonStyle}>
        <Zap size={16} aria-hidden />
        <span>
          {busy ? "Processing…" : selected ? `${selected.cta} · ${formatMoney(selected.price, selected.currency)}` : "Connect Now"}
        </span>
      </button>
    </form>
  );

  const voucherForm = (
    <form onSubmit={handleVoucher} style={{ display: "flex", flexDirection: "column", gap: 14 }} noValidate>
      <div>
        <label htmlFor={`${uid}-voucher`} style={labelStyle}>Enter your voucher code</label>
        <div style={{ position: "relative" }}>
          <Ticket size={16} aria-hidden color={pal.muted} style={{ position: "absolute", left: 12, top: 14 }} />
          <input
            id={`${uid}-voucher`}
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            placeholder="e.g. AB12-3456-CDE"
            value={voucher}
            onChange={(e) => setVoucher(e.target.value.toUpperCase())}
            style={{ ...inputStyle, paddingLeft: 36, letterSpacing: "0.06em", fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontWeight: 700 }}
          />
        </div>
      </div>
      {message}
      <button type="submit" disabled={busy} style={buttonStyle}>
        <span>{busy ? "Connecting…" : "Connect to Internet"}</span>
        <ArrowRight size={16} aria-hidden />
      </button>
    </form>
  );

  const tabBar = bothOn && config.ui.formLayout === "tabs" && (
    <div
      role="tablist"
      aria-label="Login method"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 4,
        padding: 4,
        marginBottom: 16,
        background: pal.surfaceAlt,
        borderRadius: radius.control + 4,
      }}
    >
      {(
        [
          ["MPESA", "Buy via M-Pesa"],
          ["VOUCHER", "Use Voucher"],
        ] as [Tab, string][]
      ).map(([id, label]) => (
        <button
          key={id}
          role="tab"
          type="button"
          aria-selected={tab === id}
          onClick={() => {
            setTab(id);
            setStatus(null);
          }}
          style={{
            minHeight: 40,
            fontFamily: "inherit",
            fontSize: fs(12.5),
            fontWeight: 700,
            cursor: "pointer",
            borderRadius: radius.control,
            border: "none",
            background: tab === id ? pal.primary : "transparent",
            color: tab === id ? pal.primaryText : pal.muted,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const sectionTitle = (t: string) => (
    <h2 style={{ fontSize: fs(13), fontWeight: 800, color: pal.text, margin: "0 0 12px" }}>{t}</h2>
  );

  const loginBody = (
    <>
      {config.ui.logoPosition === "inside-card" && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{logo}</div>
      )}
      {tabBar}
      {config.ui.formLayout === "tabs" || !bothOn ? (
        <div role={bothOn ? "tabpanel" : undefined}>
          {tab === "MPESA" && mpesaOn && mpesaForm}
          {tab === "VOUCHER" && voucherOn && voucherForm}
          {!mpesaOn && !voucherOn && (
            <p style={{ fontSize: fs(13), color: pal.muted }}>No login method is available. Please contact support.</p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {mpesaOn && (
            <section aria-label="Buy via M-Pesa">
              {sectionTitle("Buy a package with M-Pesa")}
              {mpesaForm}
            </section>
          )}
          {mpesaOn && voucherOn && (
            <div aria-hidden style={{ textAlign: "center", fontSize: fs(11), color: pal.muted, fontWeight: 700 }}>— OR —</div>
          )}
          {voucherOn && (
            <section aria-label="Use a voucher">
              {sectionTitle("Have a voucher?")}
              {voucherForm}
            </section>
          )}
        </div>
      )}
    </>
  );

  const heroBlock = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        textAlign: wide && config.ui.cardPosition !== "center" ? "left" : "center",
        alignItems: wide && config.ui.cardPosition !== "center" ? "flex-start" : "center",
        minWidth: 0,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: fs(compact ? 24 : wide ? 36 : 30),
          lineHeight: 1.15,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: pal.text,
          overflowWrap: "anywhere",
        }}
      >
        {config.branding.headline}
      </h1>
      {config.branding.welcomeMessage && (
        <p style={{ margin: 0, fontSize: fs(15), color: pal.muted, lineHeight: 1.5, maxWidth: 520, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
          {config.branding.welcomeMessage}
        </p>
      )}

      {announcement.enabled && announcement.text && (
        <div
          role="note"
          style={{
            display: "flex", gap: 8, alignItems: "flex-start", textAlign: "left", maxWidth: 520, width: "100%",
            padding: "10px 12px", borderRadius: radius.control, fontSize: fs(13), color: pal.text,
            background: mixColors(pal.surface, pal.accent, 0.12), border: `1px solid ${mixColors(pal.surface, pal.accent, 0.4)}`,
            whiteSpace: "pre-line", overflowWrap: "anywhere",
          }}
        >
          <Megaphone size={16} aria-hidden style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{announcement.text}</span>
        </div>
      )}

      {featuredOffer.enabled && featuredOffer.title && (
        <div
          style={{
            textAlign: "left", maxWidth: 520, width: "100%", padding: 14, borderRadius: radius.card,
            background: pal.surface, border: `2px dashed ${pal.accent}`, overflowWrap: "anywhere",
          }}
        >
          <div style={{ fontSize: fs(11), fontWeight: 800, color: pal.primaryOnSurface, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Featured offer
          </div>
          <div style={{ fontSize: fs(16), fontWeight: 800, color: pal.text, marginTop: 2 }}>{featuredOffer.title}</div>
          {featuredOffer.text && <div style={{ fontSize: fs(13), color: pal.muted, marginTop: 2 }}>{featuredOffer.text}</div>}
          {featuredOffer.ctaText && featuredOffer.ctaUrl &&
            safeLink(featuredOffer.ctaUrl, featuredOffer.ctaText, {
              display: "inline-block", marginTop: 8, fontSize: fs(13), fontWeight: 700, color: pal.primaryOnSurface, textDecoration: "underline",
            })}
        </div>
      )}
    </div>
  );

  const promoMedia = (
    <>
      {adImage.enabled && adImage.imageUrl && (
        <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
          {(() => {
            // eslint-disable-next-line @next/next/no-img-element
            const img = <img src={adImage.imageUrl} alt={adImage.alt} loading="lazy" decoding="async" style={{ width: "100%", height: "auto", maxHeight: 220, objectFit: "cover", borderRadius: radius.card, display: "block" }} />;
            return adImage.linkUrl ? safeLink(adImage.linkUrl, img, { display: "block" }) : img;
          })()}
          <div style={{ fontSize: fs(10), color: pal.muted, textAlign: "right", marginTop: 2 }}>Advertisement</div>
        </div>
      )}
      {sponsored.enabled && sponsored.text && (
        <div
          style={{
            maxWidth: 520, width: "100%", margin: "0 auto", padding: 12, borderRadius: radius.card, background: pal.surface,
            border: `1px solid ${pal.border}`, fontSize: fs(12.5), color: pal.text, overflowWrap: "anywhere",
          }}
        >
          <span style={{ fontSize: fs(10), fontWeight: 800, color: pal.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {sponsored.label || "Sponsored"}
          </span>
          <div style={{ marginTop: 2 }}>
            {sponsored.linkUrl
              ? safeLink(sponsored.linkUrl, sponsored.text, { color: pal.primaryOnSurface, textDecoration: "underline", fontWeight: 600 })
              : sponsored.text}
          </div>
        </div>
      )}
    </>
  );

  const c = config.content;
  const contactItems = [
    c.phone && { href: `tel:${c.phone.replace(/[^\d+]/g, "")}`, icon: <Phone size={14} aria-hidden />, text: c.phone },
    c.whatsapp && { href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`, icon: <MessageCircle size={14} aria-hidden />, text: `WhatsApp ${c.whatsapp}`, ext: true },
    c.email && { href: `mailto:${c.email}`, icon: <Mail size={14} aria-hidden />, text: c.email },
    c.location && { href: "", icon: <MapPin size={14} aria-hidden />, text: c.location },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; text: string; ext?: boolean }[];

  const socials = (
    [
      ["Facebook", c.social.facebook],
      ["Instagram", c.social.instagram],
      ["X", c.social.x],
      ["Website", c.social.website],
    ] as [string, string][]
  ).filter(([, url]) => url);

  const linkStyle: React.CSSProperties = { color: pal.primaryOnSurface, fontWeight: 600, textDecoration: "underline", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", minHeight: 24 };

  const supportBlock = (contactItems.length > 0 || c.supportMessage || socials.length > 0) && (
    <div
      style={{
        maxWidth: 520, width: "100%", margin: "0 auto", padding: 14, borderRadius: radius.card, background: pal.surface,
        border: `1px solid ${pal.border}`, textAlign: "center", fontSize: fs(12), color: pal.muted, overflowWrap: "anywhere",
      }}
    >
      {c.supportMessage && <div style={{ fontWeight: 600, color: pal.text, marginBottom: contactItems.length ? 8 : 0 }}>{c.supportMessage}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center" }}>
        {contactItems.map((it, i) =>
          it.href ? (
            <a key={i} href={it.href} {...(it.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} style={{ ...linkStyle, display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
              {it.icon}{it.text}
            </a>
          ) : (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{it.icon}{it.text}</span>
          )
        )}
      </div>
      {socials.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", justifyContent: "center", marginTop: 8 }}>
          {socials.map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>{name}</a>
          ))}
        </div>
      )}
    </div>
  );

  const cardPos = wide ? config.ui.cardPosition : "center";
  const twoCol = wide && config.ui.cardPosition !== "center";
  const cardCol = (
    <div style={{ width: "100%", maxWidth: 440, minWidth: 0, flex: twoCol ? "0 0 440px" : undefined }}>
      <div style={cardStyle}>{loginBody}</div>
    </div>
  );
  const textCol = (
    <div style={{ flex: twoCol ? "1 1 0" : undefined, minWidth: 0, display: "flex", flexDirection: "column", gap: 18, width: "100%" }}>
      {heroBlock}
      {promoMedia}
    </div>
  );

  const hasLegal = Boolean(c.terms || c.privacy);

  return (
    <div
      ref={ref}
      className={className}
      data-portal-template={config.template}
      style={{
        position: "relative",
        minHeight: "100%",
        width: "100%",
        overflowX: "hidden",
        color: pal.text,
        fontFamily: FONT_STACKS[config.ui.fontFamily],
        fontSize: fs(14),
        display: "flex",
        flexDirection: "column",
        ...buildBackground(config, pal),
      }}
    >
      {banner.enabled && banner.text && (
        <div
          role="note"
          style={{
            padding: "10px 16px", textAlign: "center", fontSize: fs(13), fontWeight: 600,
            background: pal.accent, color: pal.accentText, overflowWrap: "anywhere",
          }}
        >
          {banner.text}
          {banner.ctaText && banner.ctaUrl && (
            <>
              {" "}
              {safeLink(banner.ctaUrl, banner.ctaText, { color: pal.accentText, fontWeight: 800, textDecoration: "underline" })}
            </>
          )}
        </div>
      )}

      {config.ui.logoPosition !== "inside-card" && (
        <header
          style={{
            display: "flex",
            justifyContent: justify(config.ui.logoPosition),
            padding: `${compact ? 14 : 20}px ${compact ? 14 : 24}px 0`,
          }}
        >
          {logo}
        </header>
      )}

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: twoCol ? (cardPos === "left" ? "row-reverse" : "row") : "column",
          alignItems: twoCol ? "center" : "center",
          justifyContent: "center",
          gap: pad + 8,
          padding: `${pad}px ${compact ? 14 : 24}px`,
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {/* DOM order keeps the form first for keyboard users on small screens when stacked */}
        {textCol}
        {cardCol}
      </main>

      <div style={{ padding: `0 ${compact ? 14 : 24}px ${pad}px` }}>{supportBlock}</div>

      <footer
        style={{
          padding: `14px ${compact ? 14 : 24}px`, textAlign: "center", fontSize: fs(11.5), color: pal.muted,
          borderTop: `1px solid ${pal.border}`, background: pal.dark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)", overflowWrap: "anywhere",
        }}
      >
        {hasLegal && (
          <div style={{ marginBottom: 6, display: "flex", gap: 14, justifyContent: "center" }}>
            {c.terms && <button type="button" onClick={() => setLegal("terms")} style={linkStyle}>Terms &amp; Conditions</button>}
            {c.privacy && <button type="button" onClick={() => setLegal("privacy")} style={linkStyle}>Privacy Policy</button>}
          </div>
        )}
        <div>{config.branding.footerText || `© ${new Date().getFullYear()} ${config.branding.businessName}`}</div>
      </footer>

      {legal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={legal === "terms" ? "Terms and Conditions" : "Privacy Policy"}
          onKeyDown={(e) => e.key === "Escape" && setLegal(null)}
          style={{
            position: mode === "live" ? "fixed" : "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16, background: "rgba(0,0,0,0.55)",
          }}
          onClick={(e) => e.target === e.currentTarget && setLegal(null)}
        >
          <div style={{ ...cardStyle, maxWidth: 560, maxHeight: "85%", overflowY: "auto", position: "relative" }}>
            <button
              type="button"
              autoFocus
              onClick={() => setLegal(null)}
              aria-label="Close"
              style={{ position: "absolute", top: 8, right: 8, minWidth: 40, minHeight: 40, background: "none", border: "none", color: pal.text, cursor: "pointer" }}
            >
              <X size={18} aria-hidden />
            </button>
            <h2 style={{ margin: "0 0 10px", fontSize: fs(17), fontWeight: 800, color: pal.text }}>
              {legal === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            </h2>
            <div style={{ fontSize: fs(13), color: pal.text, whiteSpace: "pre-line", lineHeight: 1.55, overflowWrap: "anywhere" }}>
              {legal === "terms" ? c.terms : c.privacy}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
