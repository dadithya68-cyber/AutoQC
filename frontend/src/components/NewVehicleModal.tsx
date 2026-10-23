import React, { useState } from 'react';
import { AssemblyLine, Workstation } from '../types';
import { X, Car, Plus } from 'lucide-react';

interface NewVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleData: any) => Promise<void>;
  lines: AssemblyLine[];
  stations: Workstation[];
}

export const NewVehicleModal: React.FC<NewVehicleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lines,
  stations
}) => {
  const [model, setModel] = useState<string>('Apex-EV GT Performance');
  const [trimLevel, setTrimLevel] = useState<string>('Dual Motor AWD');
  const [color, setColor] = useState<string>('Stardust Silver Metallic');
  const [lineId, setLineId] = useState<string>(lines[0]?.id || 'line-biw');
  const [stationId, setStationId] = useState<string>(stations[0]?.id || 'station-weld-101');
  const [vin, setVin] = useState<string>(`1APEX${Date.now().toString().slice(-7)}REV`);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        vin,
        model,
        trim_level: trimLevel,
        color,
        current_line_id: lineId,
        current_station_id: stationId,
        status: 'IN_PRODUCTION'
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
      <div className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-[#1685F8]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18345F] tracking-tight">Launch New Chassis VIN</h3>
              <p className="text-xs text-[#64748B]">Inject new vehicle into assembly station queue</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[#18345F] font-semibold mb-1.5">Vehicle Identification Number (VIN) *</label>
            <input
              type="text"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              className="w-full bg-white border border-[#E2E8F0] text-[#1685F8] font-bold rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Vehicle Model *</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
              >
                <option value="Apex-EV GT Performance">Apex-EV GT Performance</option>
                <option value="Titan Pro e-SUV">Titan Pro e-SUV</option>
                <option value="Aero Compact EV">Aero Compact EV</option>
                <option value="Nexus Utility Van">Nexus Utility Van</option>
              </select>
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Trim Package *</label>
              <input
                type="text"
                value={trimLevel}
                onChange={(e) => setTrimLevel(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[#18345F] font-semibold mb-1.5">Exterior Paint Finish *</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Starting Line *</label>
              <select
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
              >
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Initial Workstation *</label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
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
          </div>

          {/* Actions */}
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
              <Plus className="w-4 h-4" />
              <span>Launch into Production</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
