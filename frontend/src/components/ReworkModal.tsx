import React, { useState } from 'react';
import { Defect, ReworkOrder } from '../types';
import { X, Wrench, CheckCircle, ShieldCheck, IndianRupee, Clock } from 'lucide-react';

interface ReworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defect: Defect;
  existingRework?: ReworkOrder | null;
  onSubmit: (reworkData: any) => Promise<void>;
  onVerify?: (reworkId: string, status: 'VERIFIED_PASS' | 'FAILED_RE_REWORK', verifier: string) => Promise<void>;
}

export const ReworkModal: React.FC<ReworkModalProps> = ({
  isOpen,
  onClose,
  defect,
  existingRework,
  onSubmit,
  onVerify
}) => {
  const [technicianName, setTechnicianName] = useState<string>(existingRework?.technician_name || 'Lead Tech Kenji Sato');
  const [rootCauseCategory, setRootCauseCategory] = useState<'MAN' | 'MACHINE' | 'METHOD' | 'MATERIAL' | 'MEASUREMENT' | 'ENVIRONMENT'>(
    existingRework?.root_cause_category || 'MACHINE'
  );
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState<string>(
    existingRework?.root_cause_analysis || ''
  );
  const [correctiveAction, setCorrectiveAction] = useState<string>(
    existingRework?.corrective_action || ''
  );
  const [partsInput, setPartsInput] = useState<string>(
    existingRework?.parts_replaced?.join(', ') || ''
  );
  const [laborMinutes, setLaborMinutes] = useState<number>(existingRework?.labor_minutes || 45);
  const [costCopq, setCostCopq] = useState<number>(existingRework?.cost_copq || 8500);
  const [notes, setNotes] = useState<string>(existingRework?.notes || '');
  const [verifierName, setVerifierName] = useState<string>('QA Supervisor Adithya');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const parts = partsInput
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      await onSubmit({
        defect_id: defect.id,
        vin: defect.vin,
        vehicle_id: defect.vehicle_id,
        technician_name: technicianName,
        root_cause_category: rootCauseCategory,
        root_cause_analysis: rootCauseAnalysis,
        corrective_action: correctiveAction,
        parts_replaced: parts,
        labor_minutes: Number(laborMinutes),
        cost_copq: Number(costCopq),
        verification_status: existingRework?.verification_status || 'PENDING',
        notes
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (status: 'VERIFIED_PASS' | 'FAILED_RE_REWORK') => {
    if (!existingRework || !onVerify) return;
    setIsSubmitting(true);
    try {
      await onVerify(existingRework.id, status, verifierName);
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
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#18345F] tracking-tight">
                {existingRework ? `Rework Order #${existingRework.id}` : 'Dispatch Rework & Root Cause Analysis'}
              </h3>
              <p className="text-xs text-[#64748B]">
                Defect {defect.id} • VIN {defect.vin} • Component: {defect.component}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#18345F] rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Defect Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-semibold text-[11px] uppercase tracking-wide">Defect Symptom</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                defect.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {defect.severity}
              </span>
            </div>
            <p className="text-[#18345F] font-medium leading-relaxed">{defect.description}</p>
          </div>

          {/* Technician & Ishikawa Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Assigned Rework Technician *</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Ishikawa 6M Root Cause Factor *</label>
              <select
                value={rootCauseCategory}
                onChange={(e) => setRootCauseCategory(e.target.value as any)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
              >
                <option value="MACHINE">Machine (Tool wear, robot offset, pneumatic drop)</option>
                <option value="MAN">Man (Technician fatigue, manual ergonomics)</option>
                <option value="METHOD">Method (SOP sequence, torque process spec)</option>
                <option value="MATERIAL">Material (Supplier batch deviation, alloy flaw)</option>
                <option value="MEASUREMENT">Measurement (Sensor drift, optical glare)</option>
                <option value="ENVIRONMENT">Environment (Humidity, temperature, airflow)</option>
              </select>
            </div>
          </div>

          {/* Root Cause Analysis Textarea */}
          <div>
            <label className="block text-[#18345F] font-semibold mb-1.5">5-Why Root Cause Investigation *</label>
            <textarea
              rows={2}
              value={rootCauseAnalysis}
              onChange={(e) => setRootCauseAnalysis(e.target.value)}
              placeholder="Why did this occur? What condition permitted the failure to develop?"
              className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none resize-none leading-relaxed"
              required
            />
          </div>

          {/* Corrective Action */}
          <div>
            <label className="block text-[#18345F] font-semibold mb-1.5">Corrective Action Taken & Prevention *</label>
            <textarea
              rows={2}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Describe rework steps, torquing, re-alignment, and containment action taken..."
              className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none resize-none leading-relaxed"
              required
            />
          </div>

          {/* Parts, Labor, COPQ Cost */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[#1685F8]" />
                <span>Labor (Minutes)</span>
              </label>
              <input
                type="number"
                min={5}
                value={laborMinutes}
                onChange={(e) => setLaborMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5 flex items-center space-x-1">
                <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                <span>Cost of Poor Quality (₹ INR)</span>
              </label>
              <input
                type="number"
                step="1"
                min={0}
                value={costCopq}
                onChange={(e) => setCostCopq(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[#18345F] font-semibold mb-1.5">Replaced Parts (comma separated)</label>
              <input
                type="text"
                value={partsInput}
                onChange={(e) => setPartsInput(e.target.value)}
                placeholder="e.g. Seal #A49, Bolt #M10"
                className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
              />
            </div>
          </div>

          {/* QA Verification Section (if existing rework) */}
          {existingRework && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#18345F] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>QA RE-INSPECTION VERIFICATION SIGN-OFF</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  existingRework.verification_status === 'VERIFIED_PASS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {existingRework.verification_status}
                </span>
              </div>

              <div>
                <label className="block text-[#18345F] font-semibold mb-1.5">Quality Inspector Sign-off Name</label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] text-[#18345F] rounded-xl p-2.5 focus:border-[#1685F8] focus:outline-none"
                />
              </div>

              {existingRework.verification_status !== 'VERIFIED_PASS' && (
                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleVerify('VERIFIED_PASS')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Quality & Close Defect</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleVerify('FAILED_RE_REWORK')}
                    className="py-2.5 px-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold transition-all"
                  >
                    Fail & Re-Rework
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-[#1685F8] hover:bg-blue-600 text-white font-semibold transition-all shadow-md flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4" />
              <span>{existingRework ? 'Update Rework Ticket' : 'Dispatch to Rework Bay'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
