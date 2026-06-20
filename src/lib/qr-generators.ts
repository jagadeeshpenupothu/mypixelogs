export type QrType =
  | "website"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "whatsapp"
  | "contact"
  | "wifi"
  | "maps"
  | "event"
  | "pdf"
  | "social";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type WifiSecurity = "WPA" | "WEP" | "Open";

export type SocialPlatform =
  | "Instagram"
  | "LinkedIn"
  | "Facebook"
  | "Twitter/X"
  | "YouTube"
  | "GitHub";

export type QrFormState = {
  websiteUrl: string;
  text: string;
  emailAddress: string;
  emailSubject: string;
  emailBody: string;
  phoneNumber: string;
  smsNumber: string;
  smsMessage: string;
  whatsappNumber: string;
  whatsappMessage: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactCompany: string;
  contactWebsite: string;
  contactAddress: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: WifiSecurity;
  mapsLatitude: string;
  mapsLongitude: string;
  mapsAddress: string;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventStartDate: string;
  eventEndDate: string;
  pdfUrl: string;
  socialPlatform: SocialPlatform;
  socialUrl: string;
};

export const qrTypeOptions: { label: string; value: QrType }[] = [
  { label: "Website", value: "website" },
  { label: "Text", value: "text" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "SMS", value: "sms" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Contact", value: "contact" },
  { label: "WiFi", value: "wifi" },
  { label: "Maps", value: "maps" },
  { label: "Event", value: "event" },
  { label: "PDF", value: "pdf" },
  { label: "Social Media", value: "social" },
];

export const initialQrFormState: QrFormState = {
  websiteUrl: "https://mypixelogs.com",
  text: "Free templates, tools, and design resources.",
  emailAddress: "",
  emailSubject: "",
  emailBody: "",
  phoneNumber: "",
  smsNumber: "",
  smsMessage: "",
  whatsappNumber: "",
  whatsappMessage: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactCompany: "",
  contactWebsite: "",
  contactAddress: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiSecurity: "WPA",
  mapsLatitude: "",
  mapsLongitude: "",
  mapsAddress: "",
  eventTitle: "",
  eventDescription: "",
  eventLocation: "",
  eventStartDate: "",
  eventEndDate: "",
  pdfUrl: "",
  socialPlatform: "Instagram",
  socialUrl: "",
};

function encodeSmsValue(value: string): string {
  return encodeURIComponent(value.trim());
}

function escapeVCardValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function escapeWifiValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/:/g, "\\:");
}

function compactPhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

function toCalendarDate(value: string): string {
  return value ? value.replace(/[-:]/g, "") : "";
}

export function buildQrValue(type: QrType, form: QrFormState): string {
  switch (type) {
    case "website":
      return form.websiteUrl.trim();
    case "text":
      return form.text;
    case "email": {
      const query = new URLSearchParams();
      if (form.emailSubject.trim()) {
        query.set("subject", form.emailSubject.trim());
      }
      if (form.emailBody.trim()) {
        query.set("body", form.emailBody.trim());
      }
      const suffix = query.toString() ? `?${query.toString()}` : "";
      return `mailto:${form.emailAddress.trim()}${suffix}`;
    }
    case "phone":
      return `tel:${compactPhoneNumber(form.phoneNumber)}`;
    case "sms":
      return `sms:${compactPhoneNumber(form.smsNumber)}${
        form.smsMessage.trim() ? `?body=${encodeSmsValue(form.smsMessage)}` : ""
      }`;
    case "whatsapp":
      return `https://wa.me/${compactPhoneNumber(form.whatsappNumber).replace("+", "")}${
        form.whatsappMessage.trim() ? `?text=${encodeSmsValue(form.whatsappMessage)}` : ""
      }`;
    case "contact":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${escapeVCardValue(form.contactName)}`,
        form.contactCompany ? `ORG:${escapeVCardValue(form.contactCompany)}` : "",
        form.contactPhone ? `TEL:${escapeVCardValue(form.contactPhone)}` : "",
        form.contactEmail ? `EMAIL:${escapeVCardValue(form.contactEmail)}` : "",
        form.contactWebsite ? `URL:${escapeVCardValue(form.contactWebsite)}` : "",
        form.contactAddress ? `ADR:;;${escapeVCardValue(form.contactAddress)};;;;` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    case "wifi": {
      const security = form.wifiSecurity === "Open" ? "nopass" : form.wifiSecurity;
      const password = form.wifiSecurity === "Open" ? "" : `P:${escapeWifiValue(form.wifiPassword)};`;
      return `WIFI:T:${security};S:${escapeWifiValue(form.wifiSsid)};${password};`;
    }
    case "maps":
      if (form.mapsLatitude.trim() && form.mapsLongitude.trim()) {
        return `https://www.google.com/maps?q=${encodeURIComponent(
          `${form.mapsLatitude.trim()},${form.mapsLongitude.trim()}`,
        )}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        form.mapsAddress.trim(),
      )}`;
    case "event":
      return [
        "BEGIN:VEVENT",
        `SUMMARY:${escapeVCardValue(form.eventTitle)}`,
        form.eventDescription ? `DESCRIPTION:${escapeVCardValue(form.eventDescription)}` : "",
        form.eventLocation ? `LOCATION:${escapeVCardValue(form.eventLocation)}` : "",
        form.eventStartDate ? `DTSTART:${toCalendarDate(form.eventStartDate)}` : "",
        form.eventEndDate ? `DTEND:${toCalendarDate(form.eventEndDate)}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\n");
    case "pdf":
      return form.pdfUrl.trim();
    case "social":
      return form.socialUrl.trim();
    default:
      return "";
  }
}

export function getQrTypeLabel(type: QrType): string {
  return qrTypeOptions.find((option) => option.value === type)?.label ?? "QR";
}
