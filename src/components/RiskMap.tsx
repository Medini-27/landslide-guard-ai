"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, CircleMarker, LayerGroup } from "leaflet";
import { riskColor, type RiskLevel } from "@/lib/risk-engine";

export interface MapPoint {
  slug: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

interface RiskMapProps {
  points: MapPoint[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

export default function RiskMap({ points, selectedSlug, onSelect }: RiskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef<Record<string, CircleMarker>>({});
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [25.9, 92.4],
        zoom: 6,
        scrollWheelZoom: false,
        attributionControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      // Ensure correct sizing inside flex/grid containers.
      setTimeout(() => map.invalidateSize(), 120);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Redraw markers when data changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current || !layerRef.current) return;
      layerRef.current.clearLayers();
      markersRef.current = {};

      points.forEach((point) => {
        const color = riskColor(point.riskLevel);
        const isSelected = point.slug === selectedSlug;

        if (isSelected) {
          L.circle([point.latitude, point.longitude], {
            radius: 26000,
            color,
            weight: 1,
            fillColor: color,
            fillOpacity: 0.16,
          }).addTo(layerRef.current!);
        }

        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: isSelected ? 13 : 9,
          color: isSelected ? "#ffffff" : color,
          weight: isSelected ? 3 : 2,
          fillColor: color,
          fillOpacity: 0.9,
        })
          .addTo(layerRef.current!)
          .bindTooltip(`${point.name} · ${point.riskLevel} (${point.riskScore})`, {
            direction: "top",
            offset: [0, -8],
          })
          .bindPopup(
            `<div style="font-family:ui-sans-serif,system-ui;min-width:190px">
               <div style="font-weight:700;font-size:14px;margin-bottom:2px">${point.name}, ${point.state}</div>
               <div style="font-size:12px;color:#475569;margin-bottom:6px">
                 ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}
               </div>
               <div style="display:inline-block;padding:3px 9px;border-radius:999px;background:${color};color:#0b1220;font-weight:700;font-size:12px">
                 ${point.riskLevel} RISK · ${point.riskScore}/100
               </div>
               <div style="font-size:11px;color:#64748b;margin-top:7px">Prototype/demo data</div>
             </div>`,
          )
          .on("click", () => selectRef.current(point.slug));

        markersRef.current[point.slug] = marker;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [points, selectedSlug]);

  // Pan to the selected location.
  useEffect(() => {
    const point = points.find((p) => p.slug === selectedSlug);
    if (!point || !mapRef.current) return;
    mapRef.current.flyTo([point.latitude, point.longitude], 9, { duration: 0.8 });
    const marker = markersRef.current[selectedSlug];
    if (marker) setTimeout(() => marker.openPopup(), 850);
  }, [selectedSlug, points]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="h-[440px] w-full rounded-xl border border-slate-700/60 bg-slate-900"
        role="application"
        aria-label="Interactive landslide risk map of North-Eastern India"
      />
      <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-lg border border-slate-700/70 bg-slate-900/90 px-3 py-2 text-[11px] text-slate-200 shadow-lg backdrop-blur">
        <div className="mb-1 font-semibold text-slate-100">Risk legend</div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#22c55e]" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f59e0b]" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#ef4444]" /> High
          </span>
        </div>
      </div>
    </div>
  );
}
