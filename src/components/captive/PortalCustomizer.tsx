"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Palette,
  LayoutTemplate,
  SlidersHorizontal,
  KeyRound,
  Layers,
  CreditCard,
  FileText,
  MessageSquare,
  Megaphone,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Rocket,
  ExternalLink,
  Undo2,
  History,
  Upload,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { btnClass } from "@/components/ui/PageHeader";
import { PortalRenderer } from "@/components/captive/PortalRenderer";
import {
  ASSET_MIME_TYPES,
  ASSET_RULES,
  BACKGROUND_STYLES,
  BUTTON_STYLES,
  CARD_POSITIONS,
  COLOR_MODES,
  FONT_FAMILIES,
  FONT_SCALES,
  FORM_LAYOUTS,
  LOGO_POSITIONS,
  PACKAGE_LAYOUTS,
  PORTAL_TEMPLATES,
  RADIUS_OPTIONS,
  SPACINGS,
  applyTemplate,
  getDefaultPortalConfig,
  getPortalWarnings,
  sanitizePortalConfig,
  type AssetKind,
  type AuthMethodInfo,
  type PlanLike,
  type PortalConfig,
  type PortalConfigVersion,
  type TemplateId,
} from "@/lib/captive/config";

// ---------------------------------------------------------------- types

interface LoadedData {
  isDemo: boolean;
  canEdit: boolean;
  organization: { name: string; slug: string };
  draft: PortalConfig;
  hasDraft?: boolean;
  published: PortalConfig | null;
  draftVersion?: PortalConfigVersion | null;
  publishedVersion?: PortalConfigVersion | null;
  versions: PortalConfigVersion[];
  plans: PlanLike[];
  methods: AuthMethodInfo[];
}

type Device = "desktop" | "tablet" | "mobile";
const DEVICES: { id: Device; label: string; width: number; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "desktop", label: "Desktop", width: 1100, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 768, icon: Tablet },
  { id: "mobile", label: "Mobile", width: 375, icon: Smartphone },
];

type SectionId = "template" | "branding" | "design" | "login" | "packages" | "content" | "messages" | "promos";
const SECTIONS: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "template", label: "Template", icon: LayoutTemplate },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "design", label: "Design", icon: SlidersHorizontal },
  { id: "login", label: "Login", icon: KeyRound },
  { id: "packages", label: "Packages", icon: Layers },
  { id: "content", label: "Content", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "promos", label: "Promotions", icon: Megaphone },
];

// ---------------------------------------------------------------- small form kit

const inputCls =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-[11px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  disabled,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          disabled={disabled}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-md border px-2.5 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-60",
            value === o
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-muted-foreground hover:text-foreground"
          )}
        >
          {o.replace("-", " ")}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  description?: string;
}) {
  return (
    <label className={cn("flex items-start gap-3", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer")}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--primary)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && <span className="block text-[11px] text-muted-foreground">{description}</span>}
      </span>
    </label>
  );
}

function ColorField({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Pick colour"
        value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#1f5fd1"}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 w-12 cursor-pointer rounded-md border border-border bg-surface p-0.5 disabled:opacity-60"
      />
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={7}
        spellCheck={false}
        className={cn(inputCls, "font-mono")}
      />
    </div>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface shadow-xs">
      <header className="border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------- image upload

function ImageUpload({
  kind,
  value,
  onChange,
  disabled,
  label,
  error,
}: {
  kind: AssetKind;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  label: string;
  error?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rule = ASSET_RULES[kind];

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setMsg(null);
    if (!ASSET_MIME_TYPES[file.type]) {
      setMsg("Only PNG, JPEG, WebP or ICO images are allowed.");
      return;
    }
    if (file.size > rule.maxBytes) {
      setMsg(`Image is too large. Maximum is ${Math.round(rule.maxBytes / 1024)} KB.`);
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("kind", kind);
      fd.set("file", file);
      const res = await fetch("/api/v1/captive/assets", { method: "POST", body: fd });
      const json = await res.json();
      if (json?.success) onChange(json.data.url);
      else setMsg(json?.message ?? "Upload failed.");
    } catch {
      setMsg("Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Field label={label} hint={`PNG, JPEG or WebP · max ${Math.round(rule.maxBytes / 1024)} KB`} error={error || msg || undefined}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-subtle">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/x-icon"
          className="sr-only"
          id={`upload-${kind}`}
          disabled={disabled || busy}
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <label
          htmlFor={`upload-${kind}`}
          className={cn(btnClass("secondary"), (disabled || busy) && "pointer-events-none opacity-50", "cursor-pointer")}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          {value ? "Replace" : "Upload"}
        </label>
        {value && !disabled && (
          <button type="button" onClick={() => onChange("")} className={btnClass("ghost")}>
            Remove
          </button>
        )}
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------- preview frame

function PreviewFrame({
  config,
  plans,
  device,
}: {
  config: PortalConfig;
  plans: PlanLike[];
  device: Device;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState(600);
  const dev = DEVICES.find((d) => d.id === device)!;
  const HEIGHT = device === "mobile" ? 640 : 560;

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    setAvail(el.clientWidth);
    const ro = new ResizeObserver((e) => setAvail(Math.round(e[0].contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(1, (avail - 2) / dev.width);
  const w = dev.width * scale;

  return (
    <div ref={outerRef} className="flex w-full justify-center">
      <div
        className="overflow-hidden rounded-xl border-2 border-border-strong bg-surface-subtle shadow-pop"
        style={{ width: w + 4, height: HEIGHT * scale + 4 }}
      >
        <div style={{ width: dev.width, height: HEIGHT, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div className="h-full overflow-y-auto overflow-x-hidden" aria-label={`${dev.label} preview`}>
            <PortalRenderer config={config} plans={plans} mode="preview" supportedMethods={["voucher", "mpesa"]} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- main component

export function PortalCustomizer() {
  const [data, setData] = useState<LoadedData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [config, setConfig] = useState<PortalConfig>(() => getDefaultPortalConfig());
  const [savedJson, setSavedJson] = useState("");
  const [section, setSection] = useState<SectionId>("template");
  const [device, setDevice] = useState<Device>("mobile");
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<null | "save" | "publish" | "restore">(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/captive/config", { cache: "no-store" });
      const json = await res.json();
      if (!json?.success) {
        setLoadError(json?.message ?? "Portal settings could not be loaded.");
        return;
      }
      const d = json.data as LoadedData;
      setData(d);
      setConfig(d.draft);
      setSavedJson(JSON.stringify(d.draft));
      setServerErrors({});
    } catch {
      setLoadError("Portal settings could not be loaded. Please try again.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canEdit = Boolean(data?.canEdit) && busy === null;
  const dirty = JSON.stringify(config) !== savedJson;

  // unsaved-changes guard
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // instant client-side validation (asset ownership is verified server-side)
  const validation = useMemo(
    () => sanitizePortalConfig(config, { isAllowedAssetUrl: () => true }),
    [config]
  );
  const errors = { ...validation.errors, ...serverErrors };
  const warnings = useMemo(() => getPortalWarnings(config), [config]);
  const hasErrors = Object.keys(validation.errors).length > 0;

  const update = useCallback((mut: (c: PortalConfig) => void) => {
    setConfig((prev) => {
      const next = structuredClone(prev);
      mut(next);
      return next;
    });
    setServerErrors({});
  }, []);

  const flash = (kind: "success" | "error", text: string) => {
    setToast({ kind, text });
    window.setTimeout(() => setToast(null), 5000);
  };

  const saveDraft = async (): Promise<boolean> => {
    setBusy("save");
    try {
      const res = await fetch("/api/v1/captive/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const json = await res.json();
      if (!json?.success) {
        setServerErrors(json?.fieldErrors ?? {});
        flash("error", json?.message ?? "Draft could not be saved.");
        return false;
      }
      setConfig(json.data.draft);
      setSavedJson(JSON.stringify(json.data.draft));
      setData((d) => (d ? { ...d, draftVersion: json.data.draftVersion, hasDraft: true } : d));
      flash("success", "Draft saved. Your live portal has not changed.");
      return true;
    } catch {
      flash("error", "Draft could not be saved. Please try again.");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    setConfirmPublish(false);
    if (dirty && !(await saveDraft())) return;
    setBusy("publish");
    try {
      const res = await fetch("/api/v1/captive/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const json = await res.json();
      if (!json?.success) {
        setServerErrors(json?.fieldErrors ?? {});
        flash("error", json?.message ?? "Publishing failed. Your live portal was not changed.");
        return;
      }
      flash("success", "Published! Your captive portal is now live.");
      await load();
    } catch {
      flash("error", "Publishing failed. Your live portal was not changed.");
    } finally {
      setBusy(null);
    }
  };

  const restore = async (version: number) => {
    setBusy("restore");
    try {
      const res = await fetch("/api/v1/captive/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", version }),
      });
      const json = await res.json();
      if (!json?.success) {
        flash("error", json?.message ?? "That version could not be restored.");
        return;
      }
      flash("success", `Version ${version} restored as your draft. Review it, then publish.`);
      setShowHistory(false);
      await load();
    } catch {
      flash("error", "That version could not be restored.");
    } finally {
      setBusy(null);
    }
  };

  const cancelChanges = () => {
    if (!data) return;
    try {
      setConfig(JSON.parse(savedJson));
      setServerErrors({});
    } catch {
      /* ignore */
    }
  };

  if (loadError) {
    return (
      <div role="alert" className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
        {loadError}
      </div>
    );
  }
  if (!data) {
    return (
      <div role="status" aria-label="Loading portal designer" className="grid gap-4 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-lg border border-border bg-surface" />
        <div className="h-96 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    );
  }

  const disabled = !canEdit;
  const publishedV = data.publishedVersion;
  const statusText = dirty
    ? "Unsaved changes"
    : data.hasDraft
      ? `Draft v${data.draftVersion?.version ?? ""} saved`
      : publishedV
        ? `Live: v${publishedV.version}`
        : "Not published yet";

  const e = (path: string) => errors[path];
  const portalUrl = data.organization.slug ? `/captive?org=${encodeURIComponent(data.organization.slug)}` : "/captive";

  // ------------------------------------------------ section bodies
  const body: Record<SectionId, React.ReactNode> = {
    template: (
      <Card
        title="Choose a template"
        description="Templates only set the look & feel. Your business name, logo, content and packages are kept."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {PORTAL_TEMPLATES.map((t) => {
            const on = config.template === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={disabled}
                aria-pressed={on}
                onClick={() => update((c) => Object.assign(c, applyTemplate(c, t.id as TemplateId)))}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors disabled:opacity-60",
                  on ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-border-strong"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden="true">
                    <span className="h-3 w-3 rounded-full border border-border" style={{ background: t.patch.branding?.primaryColor }} />
                    <span className="h-3 w-3 rounded-full border border-border" style={{ background: t.patch.branding?.accentColor }} />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{t.label}</span>
                  {on && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" aria-hidden="true" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              </button>
            );
          })}
        </div>
      </Card>
    ),

    branding: (
      <>
        <Card title="Identity">
          <Field label="ISP / business name" htmlFor="bn" error={e("branding.businessName")}>
            <input id="bn" className={inputCls} maxLength={80} disabled={disabled} value={config.branding.businessName} onChange={(ev) => update((c) => { c.branding.businessName = ev.target.value; })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUpload kind="logo" label="Logo" value={config.branding.logoUrl} disabled={disabled} error={e("branding.logoUrl")} onChange={(u) => update((c) => { c.branding.logoUrl = u; })} />
            <ImageUpload kind="favicon" label="Favicon" value={config.branding.faviconUrl} disabled={disabled} error={e("branding.faviconUrl")} onChange={(u) => update((c) => { c.branding.faviconUrl = u; })} />
          </div>
        </Card>
        <Card title="Colours">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary brand colour" htmlFor="pc" error={e("branding.primaryColor")}>
              <ColorField id="pc" disabled={disabled} value={config.branding.primaryColor} onChange={(v) => update((c) => { c.branding.primaryColor = v; })} />
            </Field>
            <Field label="Secondary / accent colour" htmlFor="ac" error={e("branding.accentColor")}>
              <ColorField id="ac" disabled={disabled} value={config.branding.accentColor} onChange={(v) => update((c) => { c.branding.accentColor = v; })} />
            </Field>
          </div>
          <ImageUpload kind="background" label="Background image" value={config.branding.backgroundImageUrl} disabled={disabled} error={e("branding.backgroundImageUrl")} onChange={(u) => update((c) => { c.branding.backgroundImageUrl = u; if (u) c.ui.background = "image"; })} />
        </Card>
        <Card title="Welcome text">
          <Field label="Welcome headline" htmlFor="hl" error={e("branding.headline")}>
            <input id="hl" className={inputCls} maxLength={80} disabled={disabled} value={config.branding.headline} onChange={(ev) => update((c) => { c.branding.headline = ev.target.value; })} />
          </Field>
          <Field label="Welcome message" htmlFor="wm" error={e("branding.welcomeMessage")}>
            <textarea id="wm" rows={3} className={inputCls} maxLength={240} disabled={disabled} value={config.branding.welcomeMessage} onChange={(ev) => update((c) => { c.branding.welcomeMessage = ev.target.value; })} />
          </Field>
          <Field label="Footer text" htmlFor="ft" hint="Leave blank for a default copyright line." error={e("branding.footerText")}>
            <input id="ft" className={inputCls} maxLength={160} disabled={disabled} value={config.branding.footerText} onChange={(ev) => update((c) => { c.branding.footerText = ev.target.value; })} />
          </Field>
        </Card>
      </>
    ),

    design: (
      <Card title="Layout & style" description="Controlled options only — the portal can't be broken by these settings.">
        <Field label="Logo position"><Segmented label="Logo position" disabled={disabled} value={config.ui.logoPosition} options={LOGO_POSITIONS} onChange={(v) => update((c) => { c.ui.logoPosition = v; })} /></Field>
        <Field label="Login card position (wide screens)"><Segmented label="Card position" disabled={disabled} value={config.ui.cardPosition} options={CARD_POSITIONS} onChange={(v) => update((c) => { c.ui.cardPosition = v; })} /></Field>
        <Field label="Login form layout"><Segmented label="Form layout" disabled={disabled} value={config.ui.formLayout} options={FORM_LAYOUTS} onChange={(v) => update((c) => { c.ui.formLayout = v; })} /></Field>
        <Field label="Button style"><Segmented label="Button style" disabled={disabled} value={config.ui.buttonStyle} options={BUTTON_STYLES} onChange={(v) => update((c) => { c.ui.buttonStyle = v; })} /></Field>
        <Field label="Border radius"><Segmented label="Border radius" disabled={disabled} value={config.ui.radius} options={RADIUS_OPTIONS} onChange={(v) => update((c) => { c.ui.radius = v; })} /></Field>
        <Field label="Font" hint="System font stacks load instantly — no extra downloads."><Segmented label="Font" disabled={disabled} value={config.ui.fontFamily} options={FONT_FAMILIES} onChange={(v) => update((c) => { c.ui.fontFamily = v; })} /></Field>
        <Field label="Font size"><Segmented label="Font size" disabled={disabled} value={config.ui.fontScale} options={FONT_SCALES} onChange={(v) => update((c) => { c.ui.fontScale = v; })} /></Field>
        <Field label="Background style"><Segmented label="Background style" disabled={disabled} value={config.ui.background} options={BACKGROUND_STYLES} onChange={(v) => update((c) => { c.ui.background = v; })} /></Field>
        <Field label="Spacing"><Segmented label="Spacing" disabled={disabled} value={config.ui.spacing} options={SPACINGS} onChange={(v) => update((c) => { c.ui.spacing = v; })} /></Field>
        <Field label="Light / dark portal" hint="'auto' follows the visitor's device setting."><Segmented label="Colour mode" disabled={disabled} value={config.ui.colorMode} options={COLOR_MODES} onChange={(v) => update((c) => { c.ui.colorMode = v; })} /></Field>
      </Card>
    ),

    login: (
      <Card title="Login methods" description="Only methods supported by the QC NetCore backend can be enabled.">
        {e("authMethods") && <p role="alert" className="text-xs font-medium text-danger">{e("authMethods")}</p>}
        <div className="space-y-3">
          {data.methods.map((m) => {
            const supported = m.supported && (m.id === "voucher" || m.id === "mpesa");
            const checked = supported ? config.authMethods[m.id as "voucher" | "mpesa"] : false;
            return (
              <div key={m.id} className="flex items-start gap-3">
                {supported ? (
                  <Toggle
                    label={m.label}
                    checked={checked}
                    disabled={disabled}
                    onChange={(v) => update((c) => { c.authMethods[m.id as "voucher" | "mpesa"] = v; })}
                  />
                ) : (
                  <div className="flex items-start gap-3 opacity-70">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <div className="text-sm font-medium text-foreground">{m.label} <span className="text-[11px] font-normal text-muted-foreground">(not available)</span></div>
                      <div className="text-[11px] text-muted-foreground">{m.reason}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-border pt-4">
          <h4 className="mb-2 text-xs font-semibold text-foreground">Payment presentation</h4>
          <div className="space-y-3">
            <Field label="Payment instructions" htmlFor="pi" error={e("payment.instructions")} hint="Shown under the M-Pesa phone number field.">
              <textarea id="pi" rows={2} maxLength={280} className={inputCls} disabled={disabled} value={config.payment.instructions} onChange={(ev) => update((c) => { c.payment.instructions = ev.target.value; })} />
            </Field>
            <Field label="Payment confirmation message" htmlFor="pcm" error={e("payment.confirmation")} hint="Leave blank to use the 'Payment successful' message. M-Pesa credentials never reach the browser.">
              <textarea id="pcm" rows={2} maxLength={280} className={inputCls} disabled={disabled} value={config.payment.confirmation} onChange={(ev) => update((c) => { c.payment.confirmation = ev.target.value; })} />
            </Field>
          </div>
        </div>
      </Card>
    ),

    packages: (
      <>
        <Card title="Display options" description="Packages come from your existing Packages page — nothing is duplicated.">
          <Field label="Layout"><Segmented label="Package layout" disabled={disabled} value={config.packages.layout} options={PACKAGE_LAYOUTS} onChange={(v) => update((c) => { c.packages.layout = v; })} /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle label="Show speed" checked={config.packages.showSpeed} disabled={disabled} onChange={(v) => update((c) => { c.packages.showSpeed = v; })} />
            <Toggle label="Show duration" checked={config.packages.showDuration} disabled={disabled} onChange={(v) => update((c) => { c.packages.showDuration = v; })} />
            <Toggle label="Show data allowance" checked={config.packages.showData} disabled={disabled} onChange={(v) => update((c) => { c.packages.showData = v; })} />
          </div>
          <Field label="Default button text" htmlFor="dcta" error={e("packages.defaultCta")}>
            <input id="dcta" className={inputCls} maxLength={30} disabled={disabled} value={config.packages.defaultCta} onChange={(ev) => update((c) => { c.packages.defaultCta = ev.target.value; })} />
          </Field>
        </Card>
        <Card title="Your hotspot packages" description="Customise how each package is presented on the portal.">
          {data.plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active hotspot packages yet. <Link href="/plans" className="font-medium text-primary hover:underline">Create one on the Packages page</Link>.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.plans.map((p) => {
                const ov = config.packages.overrides[p.id] ?? {};
                const set = (patch: Partial<typeof ov>) => update((c) => { c.packages.overrides[p.id] = { ...(c.packages.overrides[p.id] ?? {}), ...patch }; });
                return (
                  <li key={p.id} className="space-y-3 rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">KES {p.price} · {Math.round(p.downloadSpeedKbps / 1024)} Mbps</div>
                      </div>
                      <div className="flex gap-4">
                        <Toggle label="Featured" checked={Boolean(ov.featured)} disabled={disabled} onChange={(v) => set({ featured: v })} />
                        <Toggle label="Hidden" checked={Boolean(ov.hidden)} disabled={disabled} onChange={(v) => set({ hidden: v })} />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Button text" htmlFor={`cta-${p.id}`}>
                        <input id={`cta-${p.id}`} className={inputCls} maxLength={30} placeholder={config.packages.defaultCta} disabled={disabled} value={ov.cta ?? ""} onChange={(ev) => set({ cta: ev.target.value })} />
                      </Field>
                      <Field label="Description" htmlFor={`desc-${p.id}`}>
                        <input id={`desc-${p.id}`} className={inputCls} maxLength={120} disabled={disabled} value={ov.description ?? ""} onChange={(ev) => set({ description: ev.target.value })} />
                      </Field>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </>
    ),

    content: (
      <>
        <Card title="Contact & support">
          <Field label="Support message" htmlFor="sm" error={e("content.supportMessage")}>
            <input id="sm" className={inputCls} maxLength={200} disabled={disabled} value={config.content.supportMessage} onChange={(ev) => update((c) => { c.content.supportMessage = ev.target.value; })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone number" htmlFor="ph" error={e("content.phone")}><input id="ph" type="tel" className={inputCls} maxLength={20} placeholder="+254712345678" disabled={disabled} value={config.content.phone} onChange={(ev) => update((c) => { c.content.phone = ev.target.value; })} /></Field>
            <Field label="WhatsApp number" htmlFor="wa" error={e("content.whatsapp")}><input id="wa" type="tel" className={inputCls} maxLength={20} placeholder="+254712345678" disabled={disabled} value={config.content.whatsapp} onChange={(ev) => update((c) => { c.content.whatsapp = ev.target.value; })} /></Field>
            <Field label="Email" htmlFor="em" error={e("content.email")}><input id="em" type="email" className={inputCls} maxLength={254} disabled={disabled} value={config.content.email} onChange={(ev) => update((c) => { c.content.email = ev.target.value; })} /></Field>
            <Field label="Business location" htmlFor="loc" error={e("content.location")}><input id="loc" className={inputCls} maxLength={160} disabled={disabled} value={config.content.location} onChange={(ev) => update((c) => { c.content.location = ev.target.value; })} /></Field>
          </div>
        </Card>
        <Card title="Social links" description="https:// links only.">
          <div className="grid gap-4 sm:grid-cols-2">
            {(["facebook", "instagram", "x", "website"] as const).map((k) => (
              <Field key={k} label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)} htmlFor={`soc-${k}`} error={e(`content.social.${k}`)}>
                <input id={`soc-${k}`} type="url" className={inputCls} maxLength={500} placeholder="https://" disabled={disabled} value={config.content.social[k]} onChange={(ev) => update((c) => { c.content.social[k] = ev.target.value; })} />
              </Field>
            ))}
          </div>
        </Card>
        <Card title="Legal" description="Plain text only. Shown in a pop-up from the portal footer.">
          <Field label="Terms & Conditions" htmlFor="tc" error={e("content.terms")}><textarea id="tc" rows={5} maxLength={4000} className={inputCls} disabled={disabled} value={config.content.terms} onChange={(ev) => update((c) => { c.content.terms = ev.target.value; })} /></Field>
          <Field label="Privacy Policy" htmlFor="pp" error={e("content.privacy")}><textarea id="pp" rows={5} maxLength={4000} className={inputCls} disabled={disabled} value={config.content.privacy} onChange={(ev) => update((c) => { c.content.privacy = ev.target.value; })} /></Field>
        </Card>
      </>
    ),

    messages: (
      <Card title="Network & session messages" description="Shown for the matching backend states (login, voucher, payment, connection).">
        {(
          [
            ["loginSuccess", "Login success"],
            ["loginFailure", "Login failure"],
            ["sessionExpired", "Session expired"],
            ["connectionSuccess", "Connection successful"],
            ["connectionFailed", "Connection failed"],
            ["voucherInvalid", "Voucher invalid"],
            ["packageExpired", "Package expired"],
            ["paymentSuccess", "Payment successful"],
            ["paymentFailed", "Payment failed"],
          ] as const
        ).map(([k, label]) => (
          <Field key={k} label={label} htmlFor={`msg-${k}`} error={e(`messages.${k}`)}>
            <input id={`msg-${k}`} className={inputCls} maxLength={200} disabled={disabled} value={config.messages[k]} onChange={(ev) => update((c) => { c.messages[k] = ev.target.value; })} />
          </Field>
        ))}
      </Card>
    ),

    promos: (
      <>
        <p className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-xs text-muted-foreground">
          Every promotional section is off by default and only appears when you switch it on.
        </p>
        <Card title="Promotional banner">
          <Toggle label="Enable banner" checked={config.promotions.banner.enabled} disabled={disabled} onChange={(v) => update((c) => { c.promotions.banner.enabled = v; })} />
          <Field label="Banner text" htmlFor="bt" error={e("promotions.banner.text")}><input id="bt" className={inputCls} maxLength={160} disabled={disabled} value={config.promotions.banner.text} onChange={(ev) => update((c) => { c.promotions.banner.text = ev.target.value; })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button text" htmlFor="bct"><input id="bct" className={inputCls} maxLength={30} disabled={disabled} value={config.promotions.banner.ctaText} onChange={(ev) => update((c) => { c.promotions.banner.ctaText = ev.target.value; })} /></Field>
            <Field label="Button link" htmlFor="bcu" error={e("promotions.banner.ctaUrl")}><input id="bcu" type="url" placeholder="https://" className={inputCls} disabled={disabled} value={config.promotions.banner.ctaUrl} onChange={(ev) => update((c) => { c.promotions.banner.ctaUrl = ev.target.value; })} /></Field>
          </div>
        </Card>
        <Card title="Announcement">
          <Toggle label="Enable announcement" checked={config.promotions.announcement.enabled} disabled={disabled} onChange={(v) => update((c) => { c.promotions.announcement.enabled = v; })} />
          <Field label="Announcement text" htmlFor="at" error={e("promotions.announcement.text")}><textarea id="at" rows={2} maxLength={240} className={inputCls} disabled={disabled} value={config.promotions.announcement.text} onChange={(ev) => update((c) => { c.promotions.announcement.text = ev.target.value; })} /></Field>
        </Card>
        <Card title="Featured offer">
          <Toggle label="Enable featured offer" checked={config.promotions.featuredOffer.enabled} disabled={disabled} onChange={(v) => update((c) => { c.promotions.featuredOffer.enabled = v; })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Offer title" htmlFor="fot" error={e("promotions.featuredOffer.title")}><input id="fot" className={inputCls} maxLength={60} disabled={disabled} value={config.promotions.featuredOffer.title} onChange={(ev) => update((c) => { c.promotions.featuredOffer.title = ev.target.value; })} /></Field>
            <Field label="Offer details" htmlFor="fod"><input id="fod" className={inputCls} maxLength={160} disabled={disabled} value={config.promotions.featuredOffer.text} onChange={(ev) => update((c) => { c.promotions.featuredOffer.text = ev.target.value; })} /></Field>
            <Field label="Button text" htmlFor="foc"><input id="foc" className={inputCls} maxLength={30} disabled={disabled} value={config.promotions.featuredOffer.ctaText} onChange={(ev) => update((c) => { c.promotions.featuredOffer.ctaText = ev.target.value; })} /></Field>
            <Field label="Button link" htmlFor="fou" error={e("promotions.featuredOffer.ctaUrl")}><input id="fou" type="url" placeholder="https://" className={inputCls} disabled={disabled} value={config.promotions.featuredOffer.ctaUrl} onChange={(ev) => update((c) => { c.promotions.featuredOffer.ctaUrl = ev.target.value; })} /></Field>
          </div>
        </Card>
        <Card title="Advertisement image">
          <Toggle label="Enable advertisement image" checked={config.promotions.adImage.enabled} disabled={disabled} onChange={(v) => update((c) => { c.promotions.adImage.enabled = v; })} />
          <ImageUpload kind="promo" label="Image" value={config.promotions.adImage.imageUrl} disabled={disabled} error={e("promotions.adImage.imageUrl")} onChange={(u) => update((c) => { c.promotions.adImage.imageUrl = u; })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Alternative text" htmlFor="aia" error={e("promotions.adImage.alt")} hint="Describes the image for screen readers."><input id="aia" className={inputCls} maxLength={120} disabled={disabled} value={config.promotions.adImage.alt} onChange={(ev) => update((c) => { c.promotions.adImage.alt = ev.target.value; })} /></Field>
            <Field label="Link (optional)" htmlFor="ail" error={e("promotions.adImage.linkUrl")}><input id="ail" type="url" placeholder="https://" className={inputCls} disabled={disabled} value={config.promotions.adImage.linkUrl} onChange={(ev) => update((c) => { c.promotions.adImage.linkUrl = ev.target.value; })} /></Field>
          </div>
        </Card>
        <Card title="Sponsored content">
          <Toggle label="Enable sponsored content" checked={config.promotions.sponsored.enabled} disabled={disabled} onChange={(v) => update((c) => { c.promotions.sponsored.enabled = v; })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label" htmlFor="spl"><input id="spl" className={inputCls} maxLength={30} disabled={disabled} value={config.promotions.sponsored.label} onChange={(ev) => update((c) => { c.promotions.sponsored.label = ev.target.value; })} /></Field>
            <Field label="Link (optional)" htmlFor="spu" error={e("promotions.sponsored.linkUrl")}><input id="spu" type="url" placeholder="https://" className={inputCls} disabled={disabled} value={config.promotions.sponsored.linkUrl} onChange={(ev) => update((c) => { c.promotions.sponsored.linkUrl = ev.target.value; })} /></Field>
          </div>
          <Field label="Text" htmlFor="spt" error={e("promotions.sponsored.text")}><input id="spt" className={inputCls} maxLength={160} disabled={disabled} value={config.promotions.sponsored.text} onChange={(ev) => update((c) => { c.promotions.sponsored.text = ev.target.value; })} /></Field>
        </Card>
      </>
    ),
  };

  return (
    <div className="space-y-4">
      {/* Workflow bar: EDIT → PREVIEW → SAVE DRAFT → TEST → PUBLISH */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
              dirty ? "border-warning/40 bg-warning-soft text-warning" : "border-border bg-surface-subtle text-muted-foreground"
            )}
          >
            {dirty && <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />}
            {statusText}
          </span>
          {publishedV && (
            <span className="text-muted-foreground">
              Live: v{publishedV.version}
            </span>
          )}
          {data.isDemo && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Lock className="h-3 w-3" aria-hidden="true" /> Demo mode — editing & preview only. Sign in as an administrator to save.
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={cancelChanges} disabled={!dirty || busy !== null} className={btnClass("ghost")}>
            <Undo2 className="h-4 w-4" aria-hidden="true" /> Cancel
          </button>
          <button type="button" onClick={() => setShowHistory((v) => !v)} aria-expanded={showHistory} className={btnClass("secondary")}>
            <History className="h-4 w-4" aria-hidden="true" /> History
          </button>
          <button type="button" onClick={saveDraft} disabled={disabled || !dirty || hasErrors} className={btnClass("secondary")}>
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            Save draft
          </button>
          <a
            href={`${portalUrl}${portalUrl.includes("?") ? "&" : "?"}preview=draft`}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={dirty || !data.hasDraft || data.isDemo}
            onClick={(ev) => { if (dirty || !data.hasDraft || data.isDemo) ev.preventDefault(); }}
            title={dirty ? "Save your draft first, then test it on the real portal" : "Open your saved draft on the real portal"}
            className={btnClass("secondary", (dirty || !data.hasDraft || data.isDemo) ? "pointer-events-none opacity-50" : "")}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Test
          </a>
          <button type="button" onClick={() => setConfirmPublish(true)} disabled={disabled || hasErrors || (!dirty && !data.hasDraft)} className={btnClass("primary")}>
            {busy === "publish" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Rocket className="h-4 w-4" aria-hidden="true" />}
            Publish
          </button>
        </div>
      </div>

      {toast && (
        <div
          role={toast.kind === "error" ? "alert" : "status"}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium",
            toast.kind === "error" ? "border-danger/30 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success"
          )}
        >
          {toast.text}
        </div>
      )}

      {showHistory && (
        <Card title="Version history" description="Restoring copies a version into your draft. Nothing goes live until you publish.">
          {data.versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved versions yet.</p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {data.versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Version {v.version}</span>{" "}
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", v.status === "PUBLISHED" ? "bg-success-soft text-success" : v.status === "DRAFT" ? "bg-warning-soft text-warning" : "bg-surface-elevated text-muted-foreground")}>{v.status}</span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(v.publishedAt ?? v.createdAt).toLocaleString("en-KE")}
                    </div>
                  </div>
                  <button type="button" disabled={disabled || v.status === "DRAFT"} onClick={() => restore(v.version)} className={btnClass("secondary")}>
                    Restore as draft
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {confirmPublish && (
        <div role="dialog" aria-modal="true" aria-label="Confirm publish" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={(ev) => ev.key === "Escape" && setConfirmPublish(false)}>
          <div className="w-full max-w-sm space-y-3 rounded-lg border border-border bg-surface p-5 shadow-pop">
            <h3 className="text-sm font-semibold text-foreground">Publish this design?</h3>
            <p className="text-xs text-muted-foreground">
              Your live captive portal will switch to this design immediately. The current live version is kept in History so you can restore it.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" autoFocus className={btnClass("secondary")} onClick={() => setConfirmPublish(false)}>Cancel</button>
              <button type="button" className={btnClass("primary")} onClick={publish}>Publish now</button>
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning" role="note">
          <div className="mb-1 flex items-center gap-1.5 font-semibold"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" /> Suggestions</div>
          <ul className="list-disc space-y-0.5 pl-5">{warnings.map((w, i) => <li key={i}>{w.message}</li>)}</ul>
        </div>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* EDITOR */}
        <div className="space-y-4">
          <div role="tablist" aria-label="Designer sections" className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1 shadow-xs">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const on = section === s.id;
              const hasErr = Object.keys(errors).some((k) => sectionOfError(k) === s.id);
              return (
                <button
                  key={s.id}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {s.label}
                  {hasErr && <span className="h-1.5 w-1.5 rounded-full bg-danger" aria-label="has errors" />}
                </button>
              );
            })}
          </div>
          <div role="tabpanel" className="space-y-4">{body[section]}</div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="space-y-3 xl:sticky xl:top-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 shadow-xs">
            <span className="text-xs font-semibold text-foreground">Live preview</span>
            <div role="radiogroup" aria-label="Preview device" className="flex gap-1">
              {DEVICES.map((d) => {
                const Icon = d.icon;
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={device === d.id}
                    onClick={() => setDevice(d.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                      device === d.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {d.label}
                  </button>
                );
              })}
            </div>
          </div>
          <PreviewFrame config={validation.config} plans={data.plans} device={device} />
          <p className="text-center text-[11px] text-muted-foreground">
            Preview updates as you type. Payments and logins are simulated here and never sent.
          </p>
        </div>
      </div>
    </div>
  );
}

function sectionOfError(path: string): SectionId {
  if (path.startsWith("branding")) return "branding";
  if (path.startsWith("ui")) return "design";
  if (path.startsWith("authMethods") || path.startsWith("payment")) return "login";
  if (path.startsWith("packages")) return "packages";
  if (path.startsWith("content")) return "content";
  if (path.startsWith("messages")) return "messages";
  if (path.startsWith("promotions")) return "promos";
  return "template";
}
