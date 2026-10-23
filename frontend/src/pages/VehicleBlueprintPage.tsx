import React, { useState } from 'react';
import { Vehicle, Defect, VehicleZone, AssemblyLine, Workstation } from '../types';
import { DigitalVehicleBlueprint } from '../components/DigitalVehicleBlueprint';
import { Car, AlertTriangle, Wrench, CheckCircle, Search, Filter } from 'lucide-react';

interface VehicleBlueprintPageProps {
  vehicles: Vehicle[];
  defects: Defect[];
  lines: AssemblyLine[];
  stations: Workstation[];
  onPinDefectClick: (coords: { x: number; y: number; view: 'top' | 'side_left' | 'front' | 'rear'; zone: VehicleZone }) => void;
  onSelectDefect: (defect: Defect) => void;
  onOpenReworkModal: (defect: Defect) => void;
}

export const VehicleBlueprintPage: React.FC<VehicleBlueprintPageProps> = ({
  vehicles,
  defects,
  lines,
  stations,
  onPinDefectClick,
  onSelectDefect,
  onOpenReworkModal
}) => {
  const [selectedVin, setSelectedVin] = useState<string>(vehicles[0]?.vin || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedVehicle = vehicles.find(v => v.vin === selectedVin) || vehicles[0];

  // Defects for this vehicle
  const vehicleDefects = defects.filter(
    d => d.vin === selectedVehicle?.vin || d.vehicle_id === selectedVehicle?.id
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight font-mono">
            VEHICLE 2D/3D BLUEPRINT & DEFECT PINNING
          </h1>
          <p className="text-xs text-slate-400">
            Interactive chassis mesh with spatial defect locator and visual geometry inspection
          </p>
        </div>

        {/* VIN Selector */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter VIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-2 font-mono focus:border-cyan-500 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedVin}
            onChange={(e) => setSelectedVin(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-cyan-400 font-mono font-bold text-xs rounded-lg px-3 py-2 focus:border-cyan-500 focus:outline-none"
          >
            {vehicles
              .filter(v => !searchQuery || v.vin.includes(searchQuery.toUpperCase()))
              .map((v) => (
                <option key={v.id} value={v.vin}>
                  {v.vin} - {v.model} ({v.defect_count} defects)
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Selected Vehicle Badge Header */}
      {selectedVehicle && (
        <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-extrabold text-cyan-400">{selectedVehicle.vin}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  selectedVehicle.status === 'PASSED_QA' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  selectedVehicle.status === 'QUALITY_HOLD' ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' :
                  selectedVehicle.status === 'REWORK_REQUIRED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-slate-800 text-slate-300'
                }`}>
                  {selectedVehicle.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                {selectedVehicle.model} ({selectedVehicle.trim_level}) • {selectedVehicle.color}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Total Defects</span>
              <span className="text-base font-bold text-white">{vehicleDefects.length}</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase text-[10px] block">Manufacture Time</span>
              <span className="text-slate-300">{new Date(selectedVehicle.manufactured_date).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Blueprint Canvas */}
      <DigitalVehicleBlueprint
        vehicle={selectedVehicle}
        defects={defects}
        onPinDefectClick={onPinDefectClick}
        onSelectDefect={onSelectDefect}
        isPinningEnabled={true}
      />

      {/* Pinned Defects for This Specific Vehicle Table */}
      <div className="bg-[#111827] border border-[#1F293D] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                DEFECT LOG FOR VIN: {selectedVehicle?.vin}
              </h3>
              <p className="text-[11px] text-slate-400">Pinned spatial defects on this specific chassis</p>
            </div>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Showing {vehicleDefects.length} defect(s)
          </span>
        </div>

        {vehicleDefects.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            Zero defects pinned on this chassis. Golden Unit standards met.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Defect ID</th>
                  <th className="py-2.5 px-3">Component / Zone</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Coordinates</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {vehicleDefects.map((defect) => (
                  <tr key={defect.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 text-cyan-400 font-semibold">{defect.id}</td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      <div>{defect.component}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Zone: {defect.coordinates?.zone}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{defect.category}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        defect.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        defect.severity === 'MAJOR' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}>
                        {defect.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {defect.coordinates?.view?.toUpperCase()} ({defect.coordinates?.x}%, {defect.coordinates?.y}%)
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {defect.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenReworkModal(defect)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 text-[11px] transition-all"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Rework</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
