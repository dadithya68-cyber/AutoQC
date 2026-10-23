import React, { useState, useEffect } from 'react';
import { AssemblyLine, Workstation, Vehicle, DefectSeverity, VehicleZone, ShiftType } from '../types';
import { X, AlertTriangle, Crosshair, Camera, Check } from 'lucide-react';

interface DefectPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (defectData: any) => Promise<void>;
  vehicles: Vehicle[];
  lines: AssemblyLine[];
  stations: Workstation[];
  initialCoords?: { x: number; y: number; view: 'top' | 'side_left' | 'front' | 'rear'; zone: VehicleZone } | null;
  selectedVehicle?: Vehicle;
  currentShift: ShiftType;
}

export const DefectPinModal: React.FC<DefectPinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  vehicles,
  lines,
  stations,
  initialCoords,
  selectedVehicle,
  currentShift
}) => {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [lineId, setLineId] = useState<string>('');
  const [stationId, setStationId] = useState<string>('');
  const [component, setComponent] = useState<string>('');
  const [category, setCategory] = useState<string>('PAINT');
  const [severity, setSeverity] = useState<DefectSeverity>('MAJOR');
  const [description, setDescription] = useState<string>('');
  const [loggedBy, setLoggedBy] = useState<string>('Inspector Alex Morgan');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (selectedVehicle) {
      setVehicleId(selectedVehicle.id);
      setLineId(selectedVehicle.current_line_id || lines[0]?.id || '');
      setStationId(selectedVehicle.current_station_id || stations[0]?.id || '');
    } else if (vehicles.length > 0) {
      setVehicleId(vehicles[0].id);
      setLineId(vehicles[0].current_line_id || lines[0]?.id || '');
      setStationId(vehicles[0].current_station_id || stations[0]?.id || '');
    }
  }, [selectedVehicle, vehicles, lines, stations, isOpen]);

  useEffect(() => {
    if (initialCoords?.zone) {
      const zoneToComponent: Record<VehicleZone, string> = {
        HOOD: 'Hood Outer Skin Panel',
        ROOF: 'Panoramic Roof Glass Rail',
        TRUNK: 'Rear Tailgate Assembly',
        DOOR_FL: 'Front Left Door Panel',
        DOOR_FR: 'Front Right Door Panel',
        DOOR_RL: 'Rear Left Door & Quarter Panel',
        DOOR_RR: 'Rear Right Door & Quarter Panel',
        BUMPER_FRONT: 'Front Bumper Fascia & Splitter',
        BUMPER_REAR: 'Rear Diffuser Bumper',
        WINDSHIELD: 'Front Windshield A-Pillar Seal',
        UNDERBODY: 'Underbody Aerodynamic Shield',
        BATTERY_PACK: '800V High-Voltage Battery Housing',
        CABIN_INTERIOR: 'Dashboard Cockpit Module',
        POWERTRAIN: 'Electric Drive Unit Inverter'
      };
      setComponent(zoneToComponent[initialCoords.zone] || 'Exterior Body Panel');
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const activeVehicle = vehicles.find(v => v.id === vehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) return;

    setIsSubmitting(true);
    try {
      const coords = initialCoords || {
        x: 50,
        y: 50,
        view: 'top' as const,
        zone: 'HOOD' as const
      };

      await onSubmit({
        vin: activeVehicle.vin,
        vehicle_id: activeVehicle.id,
        line_id: lineId || lines[0]?.id,
        station_id: stationId || stations[0]?.id,
        component: component || 'Body Surface',
        category,
        severity,
        description,
        coordinates: coords,
        logged_by: loggedBy,
        shift: currentShift,
        photo_url: photoUrl || undefined,
        status: 'LOGGED'
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18345F] tracking-tight">Log Assembly Defect</h3>
              <p className="text-xs text-[#64748B]">Pin assembly defect with exact spatial coordinates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#18345F] rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Coordinates Bar */}
          {initialCoords && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-[#1685F8] font-sans">
              <span className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-[#1685F8]" />
                <span>CHASSIS MESH PIN: View: <strong>{initialCoords.view.toUpperCase()}</strong> | Zone: <strong>{initialCoords.zone}</strong></span>
              </span>
              <span className="font-bold">X: {initialCoords.x}% | Y: {initialCoords.y}%</span>
            </div>
          )}

          {/* Vehicle & Station Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Vehicle VIN *</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vin} ({v.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Assembly Line *</label>
              <select
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              >
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Workstation *</label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              >
                {stations
                  .filter(s => !lineId || s.line_id === lineId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Component / Assembly *</label>
              <input
                type="text"
                value={component}
                onChange={(e) => setComponent(e.target.value)}
                placeholder="e.g. Front Hood Skin, Left B-Pillar Weld"
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Category & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Defect Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 font-medium focus:border-[#1685F8] focus:outline-none"
              >
                <option value="PAINT">Paint (Runs, Sags, Inclusions, Blister)</option>
                <option value="BODY_WELD">Body / Robotic Weld (Porosity, Spatter)</option>
                <option value="DIMENSIONAL">Dimensional (Panel Gap, Flushness Out-of-Spec)</option>
                <option value="TORQUE">Torque (Over/Under Rotated Fastener)</option>
                <option value="ELECTRICAL">Electrical (Connector Unseated, Wire Pinch)</option>
                <option value="SURFACE_SCRATCH">Surface (Scratch, Dent, Dremel Mark)</option>
                <option value="MECHANICAL">Mechanical (Fluid Leak, Seal Misaligned)</option>
                <option value="ALIGNMENT">Alignment (Wheel Camber, ADAS Sensor)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Severity Level *</label>
              <div className="grid grid-cols-3 gap-2">
                {(['CRITICAL', 'MAJOR', 'MINOR'] as const).map(sev => {
                  const colors = {
                    CRITICAL: 'hover:border-rose-300 text-rose-700 border-rose-200 bg-rose-50/50',
                    MAJOR: 'hover:border-amber-300 text-amber-700 border-amber-200 bg-amber-50/50',
                    MINOR: 'hover:border-blue-300 text-blue-700 border-blue-200 bg-blue-50/50'
                  };
                  const activeColors = {
                    CRITICAL: 'border-rose-500 bg-rose-600 text-white font-bold shadow-sm',
                    MAJOR: 'border-amber-500 bg-amber-500 text-white font-bold shadow-sm',
                    MINOR: 'border-[#1685F8] bg-[#1685F8] text-white font-bold shadow-sm'
                  };

                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 rounded-xl border text-center font-semibold transition-all ${
                        severity === sev ? activeColors[sev] : colors[sev]
                      }`}
                    >
                      {sev}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#18345F] font-semibold mb-1.5">Defect Description & Optical Reading *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exact discrepancy, measured values vs nominal tolerance limits..."
              className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none resize-none leading-relaxed"
              required
            />
          </div>

          {/* Inspector name & simulated photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Inspector Name</label>
              <input
                type="text"
                value={loggedBy}
                onChange={(e) => setLoggedBy(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Inspection Photo URL (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://... or snapshot URI"
                  className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 pl-8 focus:border-[#1685F8] focus:outline-none"
                />
                <Camera className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:text-[#18345F] hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1685F8] hover:bg-blue-600 text-white font-semibold transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Broadcasting...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Log & Broadcast Defect</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
