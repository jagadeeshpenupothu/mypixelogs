"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Download,
  Gauge,
  Info,
  RefreshCcw,
  ServerCrash,
  Wifi,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SPEEDTEST_ENDPOINTS,
  SPEEDTEST_SERVER,
  SPEEDTEST_SETTINGS,
} from "@/config/speedtest";
import { cn } from "@/lib/utils";

type TestPhase = "idle" | "ping" | "download" | "upload" | "complete" | "error";

type NetworkInformationLike = {
  type?: string;
  effectiveType?: string;
  downlink?: number;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
  userAgentData?: {
    platform?: string;
  };
};

type SpeedResults = {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
};

type TransferOptions = {
  url: string;
  method: "GET" | "POST";
  body?: Blob;
  onProgress?: (loadedBytes: number, elapsedMs: number) => void;
};

const suitabilityItems = [
  { label: "Web Browsing", threshold: 1 },
  { label: "HD Streaming", threshold: 8 },
  { label: "4K Streaming", threshold: 25 },
  { label: "Video Calls", threshold: 5 },
  { label: "Online Gaming", threshold: 15, maxPing: 80 },
];

const phaseLabels: Record<TestPhase, string> = {
  idle: "Ready",
  ping: "Ping phase",
  download: "Download phase",
  upload: "Upload phase",
  complete: "Final results",
  error: "Error",
};

function formatMbps(value: number | null) {
  return value === null ? "--" : value.toFixed(value >= 100 ? 0 : 1);
}

function formatMs(value: number | null) {
  return value === null ? "--" : value.toFixed(0);
}

function normalizeServerUrl(server?: string) {
  return server?.replace(/\/+$/, "") ?? "";
}

function endpointUrl(server: string, endpoint: string, params?: Record<string, string | number>) {
  const url = new URL(`${normalizeServerUrl(server)}/${endpoint}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  url.searchParams.set("r", `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  return url.toString();
}

function getNetworkInfo() {
  if (typeof navigator === "undefined") {
    return null;
  }

  const nav = navigator as NavigatorWithConnection;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function getConnectionType(type?: string) {
  if (!type) {
    return "Unknown";
  }

  const normalizedType = type.toLowerCase();

  if (normalizedType.includes("wifi")) return "WiFi";
  if (normalizedType.includes("cellular")) return "Cellular";
  if (normalizedType.includes("ethernet")) return "Ethernet";

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function getBrowserName() {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  const ua = navigator.userAgent;

  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/") && !ua.includes("Edg/")) return "Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Firefox/")) return "Firefox";

  return "Unknown";
}

function getPlatformName() {
  if (typeof navigator === "undefined") {
    return "Unknown";
  }

  const nav = navigator as NavigatorWithConnection;
  return nav.userAgentData?.platform ?? navigator.platform ?? "Unknown";
}

function getRating(downloadMbps: number | null, uploadMbps: number | null, pingMs: number | null) {
  if (downloadMbps === null || uploadMbps === null || pingMs === null) {
    return "Not tested";
  }

  if (downloadMbps >= 100 && uploadMbps >= 20 && pingMs <= 40) return "Excellent";
  if (downloadMbps >= 30 && uploadMbps >= 10 && pingMs <= 80) return "Good";
  if (downloadMbps >= 10 && uploadMbps >= 3 && pingMs <= 140) return "Average";
  return "Poor";
}

function calculateJitter(samples: number[]) {
  if (samples.length < 2) {
    return 0;
  }

  const deltas = samples.slice(1).map((sample, index) => Math.abs(sample - samples[index]));
  return deltas.reduce((total, delta) => total + delta, 0) / deltas.length;
}

function transfer({ url, method, body, onProgress }: TransferOptions) {
  return new Promise<{ bytes: number; elapsedMs: number }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const startedAt = performance.now();
    let lastLoaded = 0;

    xhr.open(method, url, true);
    xhr.responseType = method === "GET" ? "arraybuffer" : "text";
    xhr.timeout = 30000;

    const progressTarget = method === "POST" ? xhr.upload : xhr;
    progressTarget.onprogress = (event) => {
      lastLoaded = event.loaded;
      onProgress?.(event.loaded, performance.now() - startedAt);
    };

    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`LibreSpeed server returned HTTP ${xhr.status}.`));
        return;
      }

      const elapsedMs = performance.now() - startedAt;
      const bytes =
        method === "GET" && xhr.response instanceof ArrayBuffer
          ? xhr.response.byteLength
          : body?.size ?? lastLoaded;

      resolve({ bytes, elapsedMs });
    };

    xhr.onerror = () => reject(new Error("Unable to reach the LibreSpeed server."));
    xhr.ontimeout = () => reject(new Error("The LibreSpeed server timed out."));
    xhr.send(body);
  });
}

async function measurePing(server: string) {
  const samples: number[] = [];

  for (let index = 0; index < SPEEDTEST_SETTINGS.pingSamples; index += 1) {
    const startedAt = performance.now();
    await transfer({
      url: endpointUrl(server, SPEEDTEST_ENDPOINTS.ping),
      method: "GET",
    });
    samples.push(performance.now() - startedAt);
  }

  return {
    pingMs: samples.reduce((total, sample) => total + sample, 0) / samples.length,
    jitterMs: calculateJitter(samples),
  };
}

async function measureDownload(server: string, onSpeed: (speed: number) => void) {
  const result = await transfer({
    url: endpointUrl(server, SPEEDTEST_ENDPOINTS.download, {
      ckSize: SPEEDTEST_SETTINGS.downloadSizeMb,
    }),
    method: "GET",
    onProgress: (loadedBytes, elapsedMs) => {
      if (elapsedMs > 0) {
        onSpeed((loadedBytes * 8) / (elapsedMs / 1000) / 1_000_000);
      }
    },
  });

  return (result.bytes * 8) / (result.elapsedMs / 1000) / 1_000_000;
}

async function measureUpload(server: string, onSpeed: (speed: number) => void) {
  const uploadBytes = SPEEDTEST_SETTINGS.uploadSizeMb * 1024 * 1024;
  const payload = new Blob([new Uint8Array(uploadBytes)], {
    type: "application/octet-stream",
  });

  const result = await transfer({
    url: endpointUrl(server, SPEEDTEST_ENDPOINTS.upload),
    method: "POST",
    body: payload,
    onProgress: (loadedBytes, elapsedMs) => {
      if (elapsedMs > 0) {
        onSpeed((loadedBytes * 8) / (elapsedMs / 1000) / 1_000_000);
      }
    },
  });

  return (result.bytes * 8) / (result.elapsedMs / 1000) / 1_000_000;
}

function getSuitability(results: SpeedResults | null) {
  if (!results) {
    return suitabilityItems.map((item) => ({ ...item, supported: false }));
  }

  return suitabilityItems.map((item) => ({
    ...item,
    supported:
      results.downloadMbps >= item.threshold &&
      (item.maxPing === undefined || results.pingMs <= item.maxPing),
  }));
}

function buildResultText(results: SpeedResults, rating: string) {
  return [
    "mypixelogs Internet Speed Test",
    `Download: ${results.downloadMbps.toFixed(1)} Mbps`,
    `Upload: ${results.uploadMbps.toFixed(1)} Mbps`,
    `Ping: ${results.pingMs.toFixed(0)} ms`,
    `Jitter: ${results.jitterMs.toFixed(0)} ms`,
    `Rating: ${rating}`,
  ].join("\n");
}

function downloadResultsImage(results: SpeedResults, rating: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  context.fillStyle = "#0B1220";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#172033";
  context.roundRect(70, 70, 1060, 490, 30);
  context.fill();
  context.fillStyle = "#3B82F6";
  context.roundRect(110, 110, 78, 78, 16);
  context.fill();
  context.fillStyle = "#FFFFFF";
  context.font = "700 30px Arial";
  context.fillText("mp", 130, 160);
  context.font = "700 34px Arial";
  context.fillText("mypixelogs speed test", 215, 157);
  context.font = "800 76px Arial";
  context.fillText(`${results.downloadMbps.toFixed(1)} Mbps`, 110, 290);
  context.font = "500 28px Arial";
  context.fillStyle = "#94A3B8";
  context.fillText("Download speed", 110, 335);

  const rows = [
    `Upload: ${results.uploadMbps.toFixed(1)} Mbps`,
    `Ping: ${results.pingMs.toFixed(0)} ms`,
    `Jitter: ${results.jitterMs.toFixed(0)} ms`,
    `Rating: ${rating}`,
  ];

  context.font = "600 30px Arial";
  context.fillStyle = "#F8FAFC";
  rows.forEach((row, index) => {
    context.fillText(row, 110, 405 + index * 42);
  });

  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = "mypixelogs-speed-test.png";
  link.click();
}

export function SpeedTest() {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState<number | null>(null);
  const [results, setResults] = useState<SpeedResults | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const networkInfo = getNetworkInfo();
  const serverUrl = normalizeServerUrl(SPEEDTEST_SERVER);
  const rating = getRating(
    results?.downloadMbps ?? null,
    results?.uploadMbps ?? null,
    results?.pingMs ?? null,
  );
  const suitability = getSuitability(results);
  const displayedSpeed =
    phase === "download"
      ? liveSpeed
      : phase === "upload"
        ? liveSpeed
        : results?.downloadMbps ?? null;
  const gaugeValue = Math.min(displayedSpeed ?? 0, 200);
  const gaugeDegrees = Math.min((gaugeValue / 200) * 270, 270);
  const isRunning = phase === "ping" || phase === "download" || phase === "upload";

  const connectionDetails = useMemo(
    () => [
      { label: "Connection Type", value: getConnectionType(networkInfo?.type) },
      {
        label: "Effective Network Type",
        value: networkInfo?.effectiveType?.toUpperCase() ?? "Unknown",
      },
      {
        label: "Downlink Estimate",
        value: networkInfo?.downlink ? `${networkInfo.downlink} Mbps` : "Unknown",
      },
      { label: "Browser", value: getBrowserName() },
      { label: "Platform", value: getPlatformName() },
      { label: "LibreSpeed Server", value: serverUrl || "Not configured" },
    ],
    [networkInfo?.downlink, networkInfo?.effectiveType, networkInfo?.type, serverUrl],
  );

  async function runTest() {
    setError("");
    setCopied(false);
    setResults(null);
    setLiveSpeed(null);

    if (!serverUrl) {
      setPhase("error");
      setProgress(0);
      setError("NEXT_PUBLIC_SPEEDTEST_SERVER is not configured.");
      return;
    }

    try {
      setPhase("ping");
      setProgress(10);
      const pingResult = await measurePing(serverUrl);

      setPhase("download");
      setProgress(30);
      const downloadMbps = await measureDownload(serverUrl, (speed) => {
        setLiveSpeed(speed);
        setProgress(30 + Math.min(speed / 200, 1) * 30);
      });

      setPhase("upload");
      setProgress(70);
      const uploadMbps = await measureUpload(serverUrl, (speed) => {
        setLiveSpeed(speed);
        setProgress(70 + Math.min(speed / 100, 1) * 20);
      });

      setResults({
        downloadMbps,
        uploadMbps,
        pingMs: pingResult.pingMs,
        jitterMs: pingResult.jitterMs,
      });
      setLiveSpeed(null);
      setProgress(100);
      setPhase("complete");
    } catch (testError) {
      setPhase("error");
      setLiveSpeed(null);
      setError(testError instanceof Error ? testError.message : "Speed test failed.");
    }
  }

  async function copyResults() {
    if (!results) {
      return;
    }

    await navigator.clipboard.writeText(buildResultText(results, rating));
    setCopied(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <Badge variant="secondary" className="bg-blue-50 text-primary">
              LibreSpeed powered
            </Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-normal text-foreground">
              Real connection performance
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Download, upload, ping, and jitter are measured against your configured
              LibreSpeed backend. No paid APIs or user accounts are required.
            </p>
          </div>
          <Button onClick={runTest} disabled={isRunning}>
            {isRunning ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Gauge className="h-4 w-4" />
            )}
            {phase === "complete" || phase === "error" ? "Retest" : "Start Test"}
          </Button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="mx-auto flex flex-col items-center">
            <div
              className="relative flex h-60 w-60 items-center justify-center rounded-full transition duration-300"
              style={{
                background: `conic-gradient(from 225deg, hsl(var(--primary)) ${gaugeDegrees}deg, hsl(var(--muted)) ${gaugeDegrees}deg 270deg, transparent 270deg)`,
              }}
            >
              <div className="absolute flex h-44 w-44 flex-col items-center justify-center rounded-full border border-border bg-background shadow-sm">
                <p className="text-4xl font-bold text-foreground">
                  {formatMbps(displayedSpeed)}
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {phase === "upload" ? "Upload Mbps" : "Download Mbps"}
                </p>
              </div>
            </div>
            <Badge className="mt-4">{rating}</Badge>
          </div>

          <div>
            <div className="grid gap-3 sm:grid-cols-3">
              {(["ping", "download", "upload"] as TestPhase[]).map((item) => (
                <div
                  key={item}
                  className={cn(
                    "rounded-lg border border-border bg-background p-3 text-sm font-semibold text-muted-foreground",
                    phase === item && "border-primary/40 text-primary shadow-sm",
                    (phase === "complete" ||
                      (item === "ping" && ["download", "upload"].includes(phase)) ||
                      (item === "download" && phase === "upload")) &&
                      "text-green-700",
                  )}
                >
                  {phaseLabels[item]}
                </div>
              ))}
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isRunning ? `${phaseLabels[phase]}... ${progress.toFixed(0)}%` : phaseLabels[phase]}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MetricCard label="Download Speed" value={formatMbps(results?.downloadMbps ?? null)} unit="Mbps" />
              <MetricCard label="Upload Speed" value={formatMbps(results?.uploadMbps ?? null)} unit="Mbps" />
              <MetricCard label="Ping" value={formatMs(results?.pingMs ?? null)} unit="ms" />
              <MetricCard label="Jitter" value={formatMs(results?.jitterMs ?? null)} unit="ms" />
            </div>

            {error ? (
              <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex gap-2">
                  <ServerCrash className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              </div>
            ) : null}

            {results ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={copyResults} variant="outline">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Results"}
                </Button>
                <Button onClick={() => downloadResultsImage(results, rating)} variant="outline">
                  <Download className="h-4 w-4" />
                  Download PNG Card
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Connection details</h2>
          </div>
          <div className="mt-5 space-y-4">
            {connectionDetails.map((item) => (
              <div
                key={item.label}
                className="flex justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="break-all text-right text-sm font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Suitability</h2>
          <div className="mt-5 space-y-3">
            {suitability.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold",
                    item.supported
                      ? "bg-green-50 text-green-700"
                      : "bg-slate-100 text-muted-foreground",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.supported ? "Suitable" : "Limited"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm leading-6 text-muted-foreground">
              Results depend on the configured LibreSpeed backend, CORS settings,
              WiFi signal, VPN, device power mode, and background activity.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-5">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-normal text-foreground">
        {value}
        <span className="ml-2 text-sm font-semibold text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
