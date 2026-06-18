"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

export const AVAILABLE_ICONS = [
  "Wifi", "Wind", "Tv", "ShieldCheck", "Bath", "Coffee",
  "BedDouble", "BedSingle", "Sofa", "Lamp", "AirVent", "Thermometer",
  "Utensils", "GlassWater", "UtensilsCrossed", "Wine", "Cookie", "Sandwich",
  "Car", "Waves", "Dumbbell", "Flame", "Lock", "Shirt",
  "Phone", "Printer", "Briefcase", "Package",
  "Star", "Heart", "Smile", "Sun", "Moon", "Sparkles",
  "MapPin", "Globe", "Music", "Camera",
] as const;

export type IconName = typeof AVAILABLE_ICONS[number];

type IconPickerProps = {
  value?: string;
  onChange: (icon: string) => void;
  error?: string;
  disabled?: boolean;
};

export function IconPicker({ value, onChange, error, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState({top: 0, left: 0, width: 0})
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // useEffect(() => {
  //   const handler = (e: MouseEvent) => {
  //     if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
  //       setOpen(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handler);
  //   return () => document.removeEventListener("mousedown", handler);
  // }, []);

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const filtered = useMemo(() => {
    if (!search.trim()) return AVAILABLE_ICONS;
    return AVAILABLE_ICONS.filter((name) =>
      name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const SelectedIcon = value ? (LucideIcons as any)[value] : null;

  const handleSelect = (icon: string) => {
    onChange(icon);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all text-left",
          open
            ? "border-amber-400 ring-2 ring-amber-100 bg-white"
            : "border-stone-200 bg-white hover:border-amber-300",
          error && "border-rose-300"
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          value ? "bg-amber-50" : "bg-stone-100"
        )}>
          {SelectedIcon
            ? <SelectedIcon className="w-4 h-4 text-amber-600" />
            : <LucideIcons.Smile className="w-4 h-4 text-stone-300" />
          }
        </div>

        <span className={cn("flex-1", value ? "text-stone-800 font-medium" : "text-stone-400")}>
          {value || "Pilih icon..."}
        </span>

        <LucideIcons.ChevronDown className={cn(
          "w-4 h-4 text-stone-400 transition-transform shrink-0",
          open && "rotate-180"
        )} />
      </button>

      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

      {open &&
        createPortal(
          <div
            className="fixed z-[9999] bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden pointer-events-auto"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            <div className="p-3 border-b border-stone-100">
              <p className="text-xs text-stone-400 mt-1.5">
                {filtered.length} icon tersedia
              </p>
            </div>
            
          
            <div className="p-3 max-h-56 overflow-y-auto overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
            >
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-sm">
                  Icon "{search}" tidak ditemukan
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-1.5">
                  {filtered.map((iconName) => {
                    const Icon = (LucideIcons as any)[iconName];
                    if (!Icon) return null;
                  
                    const isSelected = value === iconName;
                  
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => handleSelect(iconName)}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all",
                          isSelected
                            ? "bg-amber-50 border-amber-300 text-amber-600"
                            : "bg-white border-stone-100 text-stone-500 hover:bg-stone-50"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[9px] font-mono truncate w-full text-center opacity-60">
                          {iconName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="px-3 py-2 border-t border-stone-100 bg-stone-50">
              <p className="text-xs text-stone-400 text-center">
                Klik icon untuk memilih
              </p>
            </div>
          </div>,
        containerRef.current?.closest("[data-radix-dialog-content]") || document.body        )
      }    
  </div>
  );
}