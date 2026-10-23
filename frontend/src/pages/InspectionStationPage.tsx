import React, { useState, useEffect } from 'react';
import {
  Workstation,
  Vehicle,
  AssemblyLine,
  ShiftType,
  InspectionChecklistResult
} from '../types';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  Send
} from 'lucide-react';

interface InspectionStationPageProps {
  stations: Workstation[];
  lines: AssemblyLine[];
  vehicles: Vehicle[];
  currentShift: ShiftType;
  onSubmitInspection: (inspectionData: any) => Promise<void>;
  onTriggerDefectPin: (vehicle: Vehicle, station: Workstation) => void;
}

export const InspectionStationPage: React.FC<InspectionStationPageProps> = ({
  stations,
  lines,
  vehicles,
  currentShift,
  onSubmitInspection,
  onTriggerDefectPin
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [inspectorName, setInspectorName] = useState<string>('Inspector Adithya (ID #QA-882)');
  const [checklistResults, setChecklistResults] = useState<Record<string, { status: 'PASS' | 'FAIL'; actual_value?: string; notes?: string }>>({});
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const activeLine = lines.find(l => l.id === activeStation?.line_id);
  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    if (activeStation?.checklist_template) {
      const initial: Record<string, { status: 'PASS' | 'FAIL'; actual_value?: string; notes?: string }> = {};
      activeStation.checklist_template.forEach(item => {
        initial[item.id] = {
          status: 'PASS',
          actual_value: item.standard_spec.split(' ')[0] || 'Nominal',
          notes: ''
        };
      });
      setChecklistResults(initial);
    }
  }, [activeStation]);

  const handleStatusToggle = (itemId: string, status: 'PASS' | 'FAIL') => {
    setChecklistResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status
      }
    }));
  };

  const handleValueChange = (itemId: string, actual_value: string) => {
    setChecklistResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        actual_value
      }
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setChecklistResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const failedCount = Object.values(checklistResults).filter(r => r.status === 'FAIL').length;
  const overallStatus = failedCount === 0 ? 'PASSED' : failedCount === 1 ? 'CONDITIONAL_PASS' : 'FAILED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle || !activeStation) return;

    setIsSubmitting(true);
    try {
      const formattedResults: InspectionChecklistResult[] = (activeStation.checklist_template || []).map(item => ({
        checklist_id: item.id,
        label: item.label,
        status: checklistResults[item.id]?.status || 'PASS',
        actual_value: checklistResults[item.id]?.actual_value,
        notes: checklistResults[item.id]?.notes
      }));

      await onSubmitInspection({
        vehicle_id: activeVehicle.id,
        vin: activeVehicle.vin,
        station_id: activeStation.id,
        line_id: activeStation.line_id,
        inspector_name: inspectorName,
        shift: currentShift,
        status: overallStatus,
        notes: generalNotes,
        checklist_results: formattedResults,
        defects_found: failedCount,
        duration_seconds: 145
      });

      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-8 font-sans">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#18345F] tracking-tight">
            Digital Workstation Inspection
          </h1>
          <p className="text-xs lg:text-sm text-[#64748B] mt-0.5">
            Digital quality gate checklist, optical tolerance validation, and dispositioning
          </p>
        </div>

        {submissionSuccess && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] text-[#10B981] text-xs font-bold animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            <span>Inspection Recorded & Saved to Database</span>
          </div>
        )}
      </div>

      {/* Station Selector Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[#18345F] text-xs font-bold mb-1.5">Active Inspection Station *</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full bg-[#F5F9FE] border border-[#E2E8F0] text-[#1685F8] font-bold rounded-xl p-2.5 text-xs focus:border-[#1685F8] focus:bg-white focus:outline-none"
            >
              {stations.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} ({s.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#18345F] text-xs font-bold mb-1.5">Chassis in Workstation Queue *</label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] font-mono rounded-xl p-2.5 text-xs focus:border-[#1685F8] focus:bg-white focus:outline-none"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vin} • {v.model} ({v.color})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#18345F] text-xs font-bold mb-1.5">Quality Inspector Badge</label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="w-full bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 text-xs focus:border-[#1685F8] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Active Vehicle & Station Overview Banner */}
      {activeVehicle && activeStation && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#1685F8]">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#1685F8] font-bold">
                  {activeVehicle.vin}
                </span>
                <span className="text-xs text-[#64748B]">Shift: {currentShift.split(' ')[0]}</span>
              </div>
              <h3 className="text-base font-bold text-[#18345F] mt-1">
                {activeVehicle.model} • <span className="text-[#64748B] font-normal">{activeVehicle.trim_level}</span>
              </h3>
              <p className="text-xs text-[#64748B]">Color: {activeVehicle.color} • Line: {activeLine?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="text-[11px] text-[#64748B] uppercase font-semibold">Station Sequence</span>
              <p className="text-sm font-bold text-[#1685F8]">Stage #{activeStation.sequence_order}</p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#64748B] uppercase font-semibold">Predicted Outcome</span>
              <p className={`text-sm font-bold ${
                overallStatus === 'PASSED' ? 'text-[#10B981]' : overallStatus === 'CONDITIONAL_PASS' ? 'text-[#F59E0B]' : 'text-[#EF4444]'
              }`}>
                {overallStatus}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Digital Inspection Checklist Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#EAF2FF] text-[#1685F8]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#18345F] uppercase tracking-wide">
                Workstation Quality Gate Checklist
              </h3>
              <p className="text-xs text-[#64748B]">
                Verify nominal specifications and record optical or torque sensor measurements
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => activeVehicle && activeStation && onTriggerDefectPin(activeVehicle, activeStation)}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2] hover:bg-red-100 text-xs font-bold transition-all"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Pin Defect on Blueprint</span>
          </button>
        </div>

        {/* Checklist Items Grid */}
        <div className="space-y-4">
          {(activeStation?.checklist_template || []).map((item, idx) => {
            const currentRes = checklistResults[item.id] || { status: 'PASS' };
            const isPass = currentRes.status === 'PASS';

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPass ? 'bg-[#F8FAFC] border-slate-200' : 'bg-[#FEF2F2]/60 border-red-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Spec Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-[#18345F] font-bold">
                        #{idx + 1} • {item.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1685F8]">
                        {item.type}
                      </span>
                      {item.required && (
                        <span className="text-[10px] text-[#EF4444] font-bold">*MANDATORY</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#18345F] mt-1.5">{item.label}</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Standard Spec: <strong className="text-[#18345F]">{item.standard_spec}</strong> • Tolerance: <span className="text-[#1685F8] font-semibold">{item.tolerance}</span>
                    </p>
                  </div>

                  {/* Middle Measurement Input */}
                  <div className="w-full lg:w-48">
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Measured Value</label>
                    <input
                      type="text"
                      value={currentRes.actual_value || ''}
                      onChange={(e) => handleValueChange(item.id, e.target.value)}
                      placeholder="Actual measured"
                      className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-lg p-2 text-xs focus:border-[#1685F8] focus:outline-none"
                    />
                  </div>

                  {/* Right Pass / Fail Toggle */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(item.id, 'PASS')}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isPass
                          ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20'
                          : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#18345F]'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>PASS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusToggle(item.id, 'FAIL')}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        !isPass
                          ? 'bg-[#EF4444] text-white shadow-md shadow-red-500/20'
                          : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#18345F]'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>FAIL</span>
                    </button>
                  </div>
                </div>

                {/* Discrepancy Notes if Failed */}
                {!isPass && (
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <label className="block text-[11px] font-bold text-red-700 mb-1">Defect Remarks & Out-of-Tolerance Details</label>
                    <input
                      type="text"
                      value={currentRes.notes || ''}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                      placeholder="e.g. Measured 4.4mm gap exceeding 3.5mm ± 0.5mm nominal tolerance"
                      className="w-full bg-white border border-red-200 text-red-900 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* General Station Audit Notes */}
        <div>
          <label className="block text-xs font-bold text-[#18345F] mb-1.5">Station Audit Notes & Observations</label>
          <textarea
            rows={2}
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Additional observations, environmental conditions, or serial numbers checked..."
            className="w-full bg-[#F5F9FE] border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 text-xs focus:border-[#1685F8] focus:bg-white focus:outline-none resize-none"
          />
        </div>

        {/* Submission Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs text-[#64748B]">
            <span>Total Checklist Items: <strong className="text-[#18345F]">{activeStation?.checklist_template?.length || 0}</strong></span>
            <span>Failed Items: <strong className={failedCount > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}>{failedCount}</strong></span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#1685F8] hover:bg-[#0D6EFD] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving to Database...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Inspection & Advance Chassis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
