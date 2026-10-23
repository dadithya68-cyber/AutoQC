import React, { useState, useEffect } from 'react';
import { ActivityEvent } from '../types';
import { socketClient } from '../services/socket';
import { Activity, ArrowRight } from 'lucide-react';

interface LiveTelemetryFeedProps {
  initialEvents?: ActivityEvent[];
  onViewAll?: () => void;
}

export const LiveTelemetryFeed: React.FC<LiveTelemetryFeedProps> = ({
  initialEvents = [],
  onViewAll
}) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
    } else {
      // Default initial events matching reference screenshot
      setEvents([
        {
          id: 'act-1',
          time: '16:46',
          title: 'Defect detected at Assembly 03',
          subtitle: 'Panel misalignment (D-1042)',
          type: 'defect',
          severity: 'critical',
          defectId: 'D-1042',
          timestamp: new Date().toISOString()
        },
        {
          id: 'act-2',
          time: '16:42',
          title: 'Rework completed at Paint 02',
          subtitle: 'Surface scratch (D-1041)',
          type: 'rework',
          severity: 'info',
          defectId: 'D-1041',
          timestamp: new Date().toISOString()
        },
        {
          id: 'act-3',
          time: '16:38',
          title: 'Line 01 running normally',
          subtitle: 'Production rate 298/hr',
          type: 'normal',
          severity: 'info',
          timestamp: new Date().toISOString()
        },
        {
          id: 'act-4',
          time: '16:35',
          title: 'New defect logged',
          subtitle: 'Loose connector (D-1040)',
          type: 'defect',
          severity: 'major',
          defectId: 'D-1040',
          timestamp: new Date().toISOString()
        },
        {
          id: 'act-5',
          time: '16:30',
          title: 'Quality check passed',
          subtitle: 'Final QC - Unit #A732',
          type: 'quality',
          severity: 'info',
          timestamp: new Date().toISOString()
        }
      ]);
    }

    // Subscribe to live WebSockets
    const unsubDefect = socketClient.on('DEFECT_LOGGED', (defect) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEvt: ActivityEvent = {
        id: `act-${Date.now()}`,
        time: timeStr,
        title: `Defect logged at ${defect.station_name || defect.component}`,
        subtitle: `${defect.description.slice(0, 35)} (${defect.id})`,
        type: 'defect',
        severity: defect.severity === 'CRITICAL' ? 'critical' : defect.severity === 'MAJOR' ? 'major' : 'minor',
        defectId: defect.id,
        timestamp: now.toISOString()
      };
      setEvents(prev => [newEvt, ...prev].slice(0, 8));
    });

    const unsubRework = socketClient.on('REWORK_UPDATED', (rework) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEvt: ActivityEvent = {
        id: `act-${Date.now()}`,
        time: timeStr,
        title: `Rework ${rework.verification_status === 'VERIFIED_PASS' ? 'completed & verified' : 'in progress'}`,
        subtitle: `Defect ${rework.defect_id} (${rework.technician_name})`,
        type: 'rework',
        severity: 'info',
        defectId: rework.defect_id,
        timestamp: now.toISOString()
      };
      setEvents(prev => [newEvt, ...prev].slice(0, 8));
    });

    const unsubInsp = socketClient.on('INSPECTION_COMPLETED', (insp) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newEvt: ActivityEvent = {
        id: `act-${Date.now()}`,
        time: timeStr,
        title: `Quality check ${insp.status.toLowerCase()}`,
        subtitle: `${insp.station_name || 'Station'} - Unit #${insp.vin?.slice(-4) || 'Chassis'}`,
        type: insp.status === 'PASSED' ? 'quality' : 'defect',
        severity: insp.status === 'PASSED' ? 'info' : 'major',
        timestamp: now.toISOString()
      };
      setEvents(prev => [newEvt, ...prev].slice(0, 8));
    });

    return () => {
      unsubDefect();
      unsubRework();
      unsubInsp();
    };
  }, [initialEvents]);

  const getDotColor = (evt: ActivityEvent) => {
    if (evt.severity === 'critical') return 'bg-[#EF4444]'; // red
    if (evt.severity === 'major') return 'bg-[#F59E0B]'; // amber
    return 'bg-[#10B981]'; // green
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-[#1685F8]" />
          <h2 className="text-base font-bold text-[#18345F] font-sans">
            Live Activity Feed
          </h2>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#1685F8] hover:text-[#0D6EFD] flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Timeline items list */}
      <div className="space-y-4 flex-1">
        {events.map((evt) => (
          <div key={evt.id} className="flex items-start space-x-3 text-xs">
            {/* Timestamp */}
            <span className="font-semibold text-[#64748B] w-10 shrink-0 font-sans pt-0.5">
              {evt.time}
            </span>

            {/* Circular dot */}
            <div className="pt-1.5 shrink-0">
              <span className={`block w-2.5 h-2.5 rounded-full ${getDotColor(evt)}`} />
            </div>

            {/* Event Description */}
            <div className="flex-1 min-w-0 font-sans">
              <h4 className="font-bold text-[#18345F] text-xs leading-snug truncate">
                {evt.title}
              </h4>
              <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                {evt.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
