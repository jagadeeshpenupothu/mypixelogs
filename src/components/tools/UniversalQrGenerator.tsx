"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, ImagePlus, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildQrValue,
  type ErrorCorrectionLevel,
  getQrTypeLabel,
  initialQrFormState,
  type QrFormState,
  qrTypeOptions,
  type QrType,
  type SocialPlatform,
  type WifiSecurity,
} from "@/lib/qr-generators";

const qrSizes = [256, 512, 1024];
const errorCorrectionLevels: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];
const socialPlatforms: SocialPlatform[] = [
  "Instagram",
  "LinkedIn",
  "Facebook",
  "Twitter/X",
  "YouTube",
  "GitHub",
];
const wifiSecurityOptions: WifiSecurity[] = ["WPA", "WEP", "Open"];

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

function TextInput({ label, value, onChange, placeholder, type = "text" }: TextInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

type TextareaInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextareaInput({ label, value, onChange, placeholder }: TextareaInputProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function fileNameFor(type: QrType, extension: "png" | "svg") {
  return `${type}-qr-code.${extension}`;
}

export function UniversalQrGenerator() {
  const [qrType, setQrType] = useState<QrType>("website");
  const [form, setForm] = useState<QrFormState>(initialQrFormState);
  const [size, setSize] = useState(512);
  const [foregroundColor, setForegroundColor] = useState("#111827");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<ErrorCorrectionLevel>("M");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [pngUrl, setPngUrl] = useState<string>("");
  const [svgMarkup, setSvgMarkup] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const qrValue = useMemo(() => buildQrValue(qrType, form), [form, qrType]);

  function updateField<K extends keyof QrFormState>(key: K, value: QrFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (logoUrl) {
      URL.revokeObjectURL(logoUrl);
    }

    setLogoUrl(URL.createObjectURL(file));
    setErrorCorrectionLevel("H");
  }

  useEffect(() => {
    let isActive = true;

    async function generateQr() {
      setError(null);

      if (!qrValue.trim()) {
        setPngUrl("");
        setSvgMarkup("");
        return;
      }

      try {
        const options = {
          errorCorrectionLevel,
          margin: 2,
          width: size,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
        };

        const [nextPngUrl, nextSvgMarkup] = await Promise.all([
          QRCode.toDataURL(qrValue, options),
          QRCode.toString(qrValue, { ...options, type: "svg" }),
        ]);

        if (!isActive) {
          return;
        }

        setPngUrl(nextPngUrl);
        setSvgMarkup(nextSvgMarkup);
      } catch (qrError) {
        if (isActive) {
          setError(qrError instanceof Error ? qrError.message : "QR generation failed.");
        }
      }
    }

    void generateQr();

    return () => {
      isActive = false;
    };
  }, [backgroundColor, errorCorrectionLevel, foregroundColor, qrValue, size]);

  useEffect(() => {
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, [logoUrl]);

  const svgDownloadUrl = useMemo(() => {
    if (!svgMarkup) {
      return "";
    }

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  }, [svgMarkup]);

  function renderDynamicFields() {
    switch (qrType) {
      case "website":
        return (
          <TextInput
            label="Website URL"
            value={form.websiteUrl}
            onChange={(value) => updateField("websiteUrl", value)}
            placeholder="https://example.com"
            type="url"
          />
        );
      case "text":
        return (
          <TextareaInput
            label="Plain Text"
            value={form.text}
            onChange={(value) => updateField("text", value)}
            placeholder="Enter any text"
          />
        );
      case "email":
        return (
          <div className="grid gap-4">
            <TextInput
              label="Email Address"
              value={form.emailAddress}
              onChange={(value) => updateField("emailAddress", value)}
              placeholder="hello@example.com"
              type="email"
            />
            <TextInput
              label="Subject"
              value={form.emailSubject}
              onChange={(value) => updateField("emailSubject", value)}
              placeholder="Optional subject"
            />
            <TextareaInput
              label="Body"
              value={form.emailBody}
              onChange={(value) => updateField("emailBody", value)}
              placeholder="Optional email body"
            />
          </div>
        );
      case "phone":
        return (
          <TextInput
            label="Phone Number"
            value={form.phoneNumber}
            onChange={(value) => updateField("phoneNumber", value)}
            placeholder="+15551234567"
            type="tel"
          />
        );
      case "sms":
        return (
          <div className="grid gap-4">
            <TextInput
              label="Phone Number"
              value={form.smsNumber}
              onChange={(value) => updateField("smsNumber", value)}
              placeholder="+15551234567"
              type="tel"
            />
            <TextareaInput
              label="Message"
              value={form.smsMessage}
              onChange={(value) => updateField("smsMessage", value)}
              placeholder="Message text"
            />
          </div>
        );
      case "whatsapp":
        return (
          <div className="grid gap-4">
            <TextInput
              label="Phone Number"
              value={form.whatsappNumber}
              onChange={(value) => updateField("whatsappNumber", value)}
              placeholder="+15551234567"
              type="tel"
            />
            <TextareaInput
              label="Message"
              value={form.whatsappMessage}
              onChange={(value) => updateField("whatsappMessage", value)}
              placeholder="WhatsApp message"
            />
          </div>
        );
      case "contact":
        return (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Name" value={form.contactName} onChange={(value) => updateField("contactName", value)} />
            <TextInput label="Phone" value={form.contactPhone} onChange={(value) => updateField("contactPhone", value)} type="tel" />
            <TextInput label="Email" value={form.contactEmail} onChange={(value) => updateField("contactEmail", value)} type="email" />
            <TextInput label="Company" value={form.contactCompany} onChange={(value) => updateField("contactCompany", value)} />
            <TextInput label="Website" value={form.contactWebsite} onChange={(value) => updateField("contactWebsite", value)} type="url" />
            <TextInput label="Address" value={form.contactAddress} onChange={(value) => updateField("contactAddress", value)} />
          </div>
        );
      case "wifi":
        return (
          <div className="grid gap-4">
            <TextInput label="Network Name (SSID)" value={form.wifiSsid} onChange={(value) => updateField("wifiSsid", value)} />
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Security Type</span>
              <select
                value={form.wifiSecurity}
                onChange={(event) => updateField("wifiSecurity", event.target.value as WifiSecurity)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                {wifiSecurityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {form.wifiSecurity !== "Open" ? (
              <TextInput
                label="Password"
                value={form.wifiPassword}
                onChange={(value) => updateField("wifiPassword", value)}
                type="password"
              />
            ) : null}
          </div>
        );
      case "maps":
        return (
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Latitude" value={form.mapsLatitude} onChange={(value) => updateField("mapsLatitude", value)} />
              <TextInput label="Longitude" value={form.mapsLongitude} onChange={(value) => updateField("mapsLongitude", value)} />
            </div>
            <TextInput
              label="Address"
              value={form.mapsAddress}
              onChange={(value) => updateField("mapsAddress", value)}
              placeholder="Used when latitude/longitude are empty"
            />
          </div>
        );
      case "event":
        return (
          <div className="grid gap-4">
            <TextInput label="Title" value={form.eventTitle} onChange={(value) => updateField("eventTitle", value)} />
            <TextareaInput label="Description" value={form.eventDescription} onChange={(value) => updateField("eventDescription", value)} />
            <TextInput label="Location" value={form.eventLocation} onChange={(value) => updateField("eventLocation", value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Start Date" value={form.eventStartDate} onChange={(value) => updateField("eventStartDate", value)} type="datetime-local" />
              <TextInput label="End Date" value={form.eventEndDate} onChange={(value) => updateField("eventEndDate", value)} type="datetime-local" />
            </div>
          </div>
        );
      case "pdf":
        return (
          <TextInput
            label="PDF URL"
            value={form.pdfUrl}
            onChange={(value) => updateField("pdfUrl", value)}
            placeholder="https://example.com/file.pdf"
            type="url"
          />
        );
      case "social":
        return (
          <div className="grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Platform</span>
              <select
                value={form.socialPlatform}
                onChange={(event) => updateField("socialPlatform", event.target.value as SocialPlatform)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                {socialPlatforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>
            <TextInput
              label="Profile URL"
              value={form.socialUrl}
              onChange={(value) => updateField("socialUrl", value)}
              placeholder="https://instagram.com/username"
              type="url"
            />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Select QR Type</span>
            <select
              value={qrType}
              onChange={(event) => setQrType(event.target.value as QrType)}
              className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
            >
              {qrTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-lg border border-border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-foreground">{getQrTypeLabel(qrType)} Details</p>
            <div className="mt-4">{renderDynamicFields()}</div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-foreground">QR Size</span>
              <select
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                {qrSizes.map((option) => (
                  <option key={option} value={option}>
                    {option} px
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-foreground">Error Correction</span>
              <select
                value={errorCorrectionLevel}
                onChange={(event) => setErrorCorrectionLevel(event.target.value as ErrorCorrectionLevel)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-ring"
              >
                {errorCorrectionLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-foreground">Foreground Color</span>
              <input
                type="color"
                value={foregroundColor}
                onChange={(event) => setForegroundColor(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background p-1 shadow-sm"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-foreground">Background Color</span>
              <input
                type="color"
                value={backgroundColor}
                onChange={(event) => setBackgroundColor(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-input bg-background p-1 shadow-sm"
              />
            </label>
          </div>

          <label className="block rounded-lg border border-dashed border-border bg-slate-50 p-4">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ImagePlus className="h-4 w-4 text-primary" />
              Optional Logo Upload
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="mt-3 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Logo overlay uses high error correction and is kept small to preserve scan reliability.
            </p>
          </label>
        </div>
      </div>

      <aside className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Live QR Preview</h2>
        <div className="mt-5 rounded-lg border border-border bg-slate-50 p-5">
          <div
            className="relative mx-auto flex aspect-square max-w-[260px] items-center justify-center rounded-lg bg-white p-4 shadow-sm"
            style={{ backgroundColor }}
          >
            {pngUrl ? (
              <img src={pngUrl} alt={`${getQrTypeLabel(qrType)} QR code`} className="h-full w-full" />
            ) : (
              <QrCode className="h-16 w-16 text-muted-foreground" />
            )}
            {logoUrl && pngUrl ? (
              <div className="absolute left-1/2 top-1/2 flex h-[20%] w-[20%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white p-1 shadow-sm">
                <img src={logoUrl} alt="QR logo overlay" className="max-h-full max-w-full object-contain" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 rounded-md bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Encoded Value
          </p>
          <p className="mt-2 max-h-28 overflow-auto break-words text-sm leading-6 text-foreground">
            {qrValue || "Add QR details to generate a value."}
          </p>
        </div>

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          <Button asChild disabled={!pngUrl}>
            <a href={pngUrl || "#"} download={fileNameFor(qrType, "png")} aria-disabled={!pngUrl}>
              <Download className="h-4 w-4" />
              Download PNG
            </a>
          </Button>
          <Button asChild variant="outline" disabled={!svgDownloadUrl}>
            <a
              href={svgDownloadUrl || "#"}
              download={fileNameFor(qrType, "svg")}
              aria-disabled={!svgDownloadUrl}
            >
              <Download className="h-4 w-4" />
              Download SVG
            </a>
          </Button>
        </div>
      </aside>
    </div>
  );
}
