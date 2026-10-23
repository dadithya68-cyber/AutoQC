import React, { useState, useRef } from 'react';
import { Defect, Vehicle, VehicleZone } from '../types';
import { Eye, Crosshair, AlertCircle, CheckCircle2, ShieldAlert, Layers } from 'lucide-react';

interface DigitalVehicleBlueprintProps {
  vehicle?: Vehicle;
  defects: Defect[];
  onPinDefectClick?: (coords: { x: number; y: number; view: 'top' | 'side_left' | 'front' | 'rear'; zone: VehicleZone }) => void;
  onSelectDefect?: (defect: Defect) => void;
  isPinningEnabled?: boolean;
}

export const DigitalVehicleBlueprint: React.FC<DigitalVehicleBlueprintProps> = ({
  vehicle,
  defects,
  onPinDefectClick,
  onSelectDefect,
  isPinningEnabled = true
}) => {
  const [activeView, setActiveView] = useState<'top' | 'side_left' | 'front' | 'rear'>('top');
  const [hoveredDefect, setHoveredDefect] = useState<Defect | null>(null);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter defects that belong to the active blueprint view and selected vehicle (if selected)
  const viewDefects = defects.filter(d => {
    const matchesView = d.coordinates?.view === activeView;
    const matchesVehicle = vehicle ? (d.vehicle_id === vehicle.id || d.vin === vehicle.vin) : true;
    return matchesView && matchesVehicle;
  });

  const handleBlueprintClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinningEnabled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Approximate zone based on view and coordinates
    let estimatedZone: VehicleZone = 'HOOD';
    if (activeView === 'top') {
      if (x < 30) estimatedZone = 'HOOD';
      else if (x > 75) estimatedZone = 'TRUNK';
      else if (y < 35) estimatedZone = 'DOOR_FL';
      else if (y > 65) estimatedZone = 'DOOR_FR';
      else estimatedZone = 'ROOF';
    } else if (activeView === 'side_left') {
      if (x < 25) estimatedZone = 'BUMPER_FRONT';
      else if (x < 45) estimatedZone = 'DOOR_FL';
      else if (x < 75) estimatedZone = 'DOOR_RL';
      else if (x > 75) estimatedZone = 'BUMPER_REAR';
      else if (y > 60) estimatedZone = 'BATTERY_PACK';
      else estimatedZone = 'ROOF';
    } else if (activeView === 'front') {
      estimatedZone = y > 50 ? 'BUMPER_FRONT' : 'HOOD';
    } else if (activeView === 'rear') {
      estimatedZone = y > 50 ? 'BUMPER_REAR' : 'TRUNK';
    }

    setPendingPin({ x, y });

    if (onPinDefectClick) {
      onPinDefectClick({ x, y, view: activeView, zone: estimatedZone });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white border-rose-300 shadow-lg shadow-rose-500/50';
      case 'MAJOR':
        return 'bg-amber-500 text-white border-amber-300 shadow-md shadow-amber-500/40';
      case 'MINOR':
        return 'bg-cyan-500 text-white border-cyan-300 shadow-md shadow-cyan-500/30';
      default:
        return 'bg-slate-500 text-white border-slate-300';
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-card font-sans">
      {/* Blueprint Control Bar */}
      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-[#EAF2FF] text-[#1685F8]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#18345F] tracking-tight">
              Digital Vehicle Blueprint & Pin-Marker
            </h3>
            {vehicle ? (
              <p className="text-xs text-[#64748B]">
                Active VIN: <span className="text-[#1685F8] font-bold">{vehicle.vin}</span> ({vehicle.model} - {vehicle.trim_level})
              </p>
            ) : (
              <p className="text-xs text-[#64748B]">All Active Assembly Defect Markers</p>
            )}
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-1.5 bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-sm">
          {(['top', 'side_left', 'front', 'rear'] as const).map(view => {
            const labels = {
              top: "Top View",
              side_left: "Side Profile",
              front: "Front Fascia",
              rear: "Rear Deck"
            };
            const count = defects.filter(d => d.coordinates?.view === view).length;

            return (
              <button
                key={view}
                onClick={() => {
                  setActiveView(view);
                  setPendingPin(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  activeView === view
                    ? 'bg-[#1685F8] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#18345F]'
                }`}
              >
                <span>{labels[view]}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeView === view ? 'bg-white text-[#1685F8]' : 'bg-slate-100 text-[#64748B]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blueprint Drawing Area */}
      <div className="relative p-6 bg-radial-gradient flex items-center justify-center min-h-[380px] select-none">
        {/* Helper Instructions Overlay */}
        <div className="absolute top-4 left-6 z-10 flex items-center space-x-2 text-xs text-slate-400 font-mono bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click anywhere on the chassis to pin a defect</span>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-6 z-10 hidden sm:flex items-center space-x-3 text-[11px] font-mono bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800">
          <span className="flex items-center space-x-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block mr-1" /> Critical
          </span>
          <span className="flex items-center space-x-1 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block mr-1" /> Major
          </span>
          <span className="flex items-center space-x-1 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block mr-1" /> Minor
          </span>
        </div>

        {/* Blueprint Canvas Container */}
        <div
          ref={containerRef}
          onClick={handleBlueprintClick}
          className="relative w-full max-w-3xl aspect-[2/1] cursor-crosshair rounded-xl border border-cyan-900/40 bg-slate-950/90 shadow-2xl overflow-hidden flex items-center justify-center group"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.06) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Subtle Grid crosshairs */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-[1px] bg-cyan-500 top-1/2 absolute" />
            <div className="h-full w-[1px] bg-cyan-500 left-1/2 absolute" />
          </div>

          {/* SVG Vehicle Wireframe by View */}
          {activeView === 'top' && (
            <svg viewBox="0 0 800 400" className="w-full h-full p-6 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {/* Outer body contour */}
              <path
                d="M 140 130 C 180 90, 240 70, 400 70 C 560 70, 640 85, 710 130 C 730 145, 740 170, 740 200 C 740 230, 730 255, 710 270 C 640 315, 560 330, 400 330 C 240 330, 180 310, 140 270 C 110 240, 100 220, 100 200 C 100 180, 110 160, 140 130 Z"
                fill="rgba(6, 182, 212, 0.04)"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Hood section */}
              <path d="M 140 130 Q 230 140 260 115 L 260 285 Q 230 260 140 270" fill="none" stroke="#0891B2" strokeWidth="1.8" strokeDasharray="4 2" />

              {/* Front Windshield */}
              <path d="M 270 120 L 340 140 L 340 260 L 270 280 Z" fill="rgba(6,182,212,0.1)" stroke="#22D3EE" strokeWidth="2" />

              {/* Panoramic Glass Roof */}
              <rect x="350" y="130" width="180" height="140" rx="8" fill="rgba(6,182,212,0.06)" stroke="#0891B2" strokeWidth="1.8" />

              {/* Rear Windshield */}
              <path d="M 540 140 L 600 125 L 600 275 L 540 260 Z" fill="rgba(6,182,212,0.1)" stroke="#22D3EE" strokeWidth="2" />

              {/* Trunk / Tailgate */}
              <path d="M 610 125 Q 670 140 710 150 L 710 250 Q 670 260 610 275" fill="none" stroke="#0891B2" strokeWidth="1.8" />

              {/* Wheels / Tires Top view representation */}
              <rect x="180" y="55" width="70" height="20" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
              <rect x="180" y="325" width="70" height="20" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
              <rect x="550" y="55" width="70" height="20" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />
              <rect x="550" y="325" width="70" height="20" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1.5" />

              {/* Doors Seam Lines */}
              <line x1="390" y1="72" x2="390" y2="130" stroke="#0891B2" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="390" y1="270" x2="390" y2="328" stroke="#0891B2" strokeWidth="1.5" strokeDasharray="3 3" />

              <text x="180" y="205" fill="#0891B2" fontSize="12" fontFamily="monospace" textAnchor="middle" letterSpacing="2">HOOD / MOTOR</text>
              <text x="440" y="205" fill="#22D3EE" fontSize="12" fontFamily="monospace" textAnchor="middle" letterSpacing="2">BATTERY / CABIN</text>
              <text x="660" y="205" fill="#0891B2" fontSize="12" fontFamily="monospace" textAnchor="middle" letterSpacing="2">TRUNK</text>
            </svg>
          )}

          {activeView === 'side_left' && (
            <svg viewBox="0 0 800 400" className="w-full h-full p-6 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {/* Car Side Profile Contour */}
              <path
                d="M 80 260 L 140 260 C 150 210, 230 210, 240 260 L 490 260 C 500 210, 580 210, 590 260 L 710 260 C 720 220, 715 190, 680 170 C 650 150, 590 120, 540 110 L 360 110 C 270 120, 230 170, 180 180 L 110 190 C 85 200, 80 230, 80 260 Z"
                fill="rgba(6, 182, 212, 0.04)"
                stroke="#06B6D4"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* Windows Area */}
              <path
                d="M 270 175 L 340 130 L 430 130 L 430 180 L 270 180 Z"
                fill="rgba(6, 182, 212, 0.1)"
                stroke="#22D3EE"
                strokeWidth="1.8"
              />
              <path
                d="M 445 130 L 530 130 C 570 145, 600 170, 610 180 L 445 180 Z"
                fill="rgba(6, 182, 212, 0.1)"
                stroke="#22D3EE"
                strokeWidth="1.8"
              />

              {/* Door Cutlines */}
              <line x1="270" y1="180" x2="260" y2="260" stroke="#0891B2" strokeWidth="1.5" />
              <line x1="438" y1="120" x2="438" y2="260" stroke="#0891B2" strokeWidth="1.5" />
              <line x1="580" y1="180" x2="560" y2="260" stroke="#0891B2" strokeWidth="1.5" />

              {/* Wheels */}
              <circle cx="190" cy="260" r="42" fill="#0F172A" stroke="#06B6D4" strokeWidth="2.5" />
              <circle cx="190" cy="260" r="22" fill="#1E293B" stroke="#22D3EE" strokeWidth="1.5" />

              <circle cx="540" cy="260" r="42" fill="#0F172A" stroke="#06B6D4" strokeWidth="2.5" />
              <circle cx="540" cy="260" r="22" fill="#1E293B" stroke="#22D3EE" strokeWidth="1.5" />

              {/* Rocker panel / Underbody */}
              <line x1="240" y1="262" x2="490" y2="262" stroke="#06B6D4" strokeWidth="3" />

              <text x="350" y="225" fill="#0891B2" fontSize="11" fontFamily="monospace" textAnchor="middle">DRIVER DOOR</text>
              <text x="495" y="225" fill="#0891B2" fontSize="11" fontFamily="monospace" textAnchor="middle">PASSENGER DOOR</text>
            </svg>
          )}

          {activeView === 'front' && (
            <svg viewBox="0 0 800 400" className="w-full h-full p-6 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {/* Front Fascia Outline */}
              <path
                d="M 230 110 C 330 95, 470 95, 570 110 C 620 120, 660 160, 670 210 L 670 280 C 660 300, 620 310, 580 310 L 220 310 C 180 310, 140 300, 130 280 L 130 210 C 140 160, 180 120, 230 110 Z"
                fill="rgba(6, 182, 212, 0.04)"
                stroke="#06B6D4"
                strokeWidth="2.5"
              />
              {/* Windshield */}
              <path d="M 240 125 L 300 180 L 500 180 L 560 125 Z" fill="rgba(6,182,212,0.12)" stroke="#22D3EE" strokeWidth="2" />
              {/* Headlamps */}
              <polygon points="180,200 250,195 240,225 170,220" fill="rgba(6,182,212,0.3)" stroke="#22D3EE" strokeWidth="1.5" />
              <polygon points="620,200 550,195 560,225 630,220" fill="rgba(6,182,212,0.3)" stroke="#22D3EE" strokeWidth="1.5" />
              {/* Lower grille */}
              <rect x="280" y="240" width="240" height="40" rx="4" fill="rgba(15,23,42,0.8)" stroke="#0891B2" strokeWidth="1.5" />
              {/* Tires */}
              <rect x="110" y="260" width="30" height="60" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
              <rect x="660" y="260" width="30" height="60" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
            </svg>
          )}

          {activeView === 'rear' && (
            <svg viewBox="0 0 800 400" className="w-full h-full p-6 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              {/* Rear Contour */}
              <path
                d="M 240 115 C 330 100, 470 100, 560 115 C 610 125, 650 165, 660 215 L 660 280 C 650 300, 610 310, 570 310 L 230 310 C 190 310, 150 300, 140 280 L 140 215 C 150 165, 190 125, 240 115 Z"
                fill="rgba(6, 182, 212, 0.04)"
                stroke="#06B6D4"
                strokeWidth="2.5"
              />
              {/* Rear Window */}
              <path d="M 260 130 L 310 180 L 490 180 L 540 130 Z" fill="rgba(6,182,212,0.12)" stroke="#22D3EE" strokeWidth="2" />
              {/* LED Lightbar */}
              <line x1="200" y1="205" x2="600" y2="205" stroke="#F43F5E" strokeWidth="4" strokeLinecap="round" />
              {/* Diffuser */}
              <rect x="300" y="260" width="200" height="35" rx="4" fill="rgba(15,23,42,0.8)" stroke="#0891B2" strokeWidth="1.5" />
              {/* Tires */}
              <rect x="120" y="260" width="30" height="60" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
              <rect x="650" y="260" width="30" height="60" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
            </svg>
          )}

          {/* Pending Pin Crosshair (when inspector clicks) */}
          {pendingPin && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
              style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-dashed animate-spin flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
            </div>
          )}

          {/* Render Existing Defect Markers */}
          {viewDefects.map((defect) => {
            const isCritical = defect.severity === 'CRITICAL';
            const isOpen = defect.status !== 'CLOSED' && defect.status !== 'VERIFIED';

            return (
              <div
                key={defect.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectDefect) onSelectDefect(defect);
                }}
                onMouseEnter={() => setHoveredDefect(defect)}
                onMouseLeave={() => setHoveredDefect(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform hover:scale-125"
                style={{
                  left: `${defect.coordinates.x}%`,
                  top: `${defect.coordinates.y}%`
                }}
              >
                {/* Ping wave for critical open defects */}
                {isCritical && isOpen && (
                  <span className="absolute -inset-2 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                )}

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${getSeverityColor(
                    defect.severity
                  )}`}
                >
                  !
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Defect Tooltip Card */}
        {hoveredDefect && (
          <div className="absolute bottom-4 left-6 right-6 sm:left-auto sm:right-6 sm:w-80 bg-white/95 border border-[#E2E8F0] rounded-2xl p-4 shadow-card-hover backdrop-blur-md z-30 font-sans pointer-events-none animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1685F8]">
                  {hoveredDefect.id}
                </span>
                <h4 className="text-sm font-bold text-[#18345F] mt-1.5">{hoveredDefect.component}</h4>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hoveredDefect.severity === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : hoveredDefect.severity === 'MAJOR'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {hoveredDefect.severity}
              </span>
            </div>

            <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">{hoveredDefect.description}</p>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Status: <strong className="text-[#18345F]">{hoveredDefect.status}</strong></span>
              <span>By: {hoveredDefect.logged_by.split(' ')[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Blueprint Footer Stats */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center space-x-4">
          <span>Active View: <strong className="text-[#1685F8]">{activeView.toUpperCase()}</strong></span>
          <span>Pinned Defects: <strong className="text-[#18345F] font-bold">{viewDefects.length}</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Coordinates: Percentage relative mesh (0-100%)</span>
        </div>
      </div>
    </div>
  );
};
