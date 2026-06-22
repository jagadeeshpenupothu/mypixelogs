"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type Density = "compact" | "comfortable";

type Preferences = {
  density: Density;
  autoExpandCategories: boolean;
  rememberCollapseState: boolean;
  showPopularTemplates: boolean;
  showPopularTools: boolean;
  showPopularAssets: boolean;
};

const preferencesStorageKey = "mypixelogs:preferences";

const defaultPreferences: Preferences = {
  density: "comfortable",
  autoExpandCategories: true,
  rememberCollapseState: true,
  showPopularTemplates: true,
  showPopularTools: true,
  showPopularAssets: true,
};

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

function readPreferences(): Preferences {
  try {
    const savedValue = window.localStorage.getItem(preferencesStorageKey);
    if (!savedValue) return defaultPreferences;

    return {
      ...defaultPreferences,
      ...JSON.parse(savedValue),
    };
  } catch {
    return defaultPreferences;
  }
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors duration-200 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      <span>{label}</span>
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border transition-colors duration-200",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
        )}
        aria-hidden="true"
      >
        {checked ? <Check className="h-3 w-3" /> : null}
      </span>
    </button>
  );
}

export function PreferencesMenu() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      setPreferences(readPreferences());
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    try {
      window.localStorage.setItem(preferencesStorageKey, JSON.stringify(preferences));
      document.documentElement.dataset.viewDensity = preferences.density;
    } catch {
      // Preferences are optional; the UI still works for the current session.
    }
  }, [mounted, preferences]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function updatePreference<Key extends keyof Preferences>(key: Key, value: Preferences[Key]) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-foreground shadow-sm transition-[color,background-color,border-color,box-shadow] duration-200 hover:border-foreground/20 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:bg-[#0A0A0A] dark:hover:border-white/20"
        aria-label="Open preferences"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Preferences"
      >
        <Settings2 className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Preferences"
          className="absolute right-0 z-[80] mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-card p-3 shadow-soft"
        >
          <div className="border-b border-border px-1 pb-3">
            <p className="text-sm font-semibold text-foreground">Preferences</p>
            <p className="mt-1 text-xs text-muted-foreground">Tune the public library experience.</p>
          </div>

          <div className="space-y-4 pt-3">
            <section>
              <h2 className="px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Appearance
              </h2>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted p-1">
                {themeOptions.map((option) => {
                  const isSelected = (mounted ? theme : "system") === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "rounded-md px-2 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                        isSelected
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                View Density
              </h2>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
                {(["compact", "comfortable"] as Density[]).map((density) => (
                  <button
                    key={density}
                    type="button"
                    onClick={() => updatePreference("density", density)}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-xs font-semibold capitalize transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                      preferences.density === density
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Sidebar
              </h2>
              <div className="mt-1 space-y-1">
                <PreferenceToggle
                  label="Auto Expand Categories"
                  checked={preferences.autoExpandCategories}
                  onChange={() =>
                    updatePreference("autoExpandCategories", !preferences.autoExpandCategories)
                  }
                />
                <PreferenceToggle
                  label="Remember Collapse State"
                  checked={preferences.rememberCollapseState}
                  onChange={() =>
                    updatePreference("rememberCollapseState", !preferences.rememberCollapseState)
                  }
                />
              </div>
            </section>

            <section>
              <h2 className="px-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                Homepage
              </h2>
              <div className="mt-1 space-y-1">
                <PreferenceToggle
                  label="Show Popular Templates"
                  checked={preferences.showPopularTemplates}
                  onChange={() =>
                    updatePreference("showPopularTemplates", !preferences.showPopularTemplates)
                  }
                />
                <PreferenceToggle
                  label="Show Popular Tools"
                  checked={preferences.showPopularTools}
                  onChange={() => updatePreference("showPopularTools", !preferences.showPopularTools)}
                />
                <PreferenceToggle
                  label="Show Popular Assets"
                  checked={preferences.showPopularAssets}
                  onChange={() => updatePreference("showPopularAssets", !preferences.showPopularAssets)}
                />
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
