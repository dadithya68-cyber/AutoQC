import React from 'react';
import {
  LayoutGrid,
  Radio,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  TrendingUp,
  GitBranch,
  Settings,
  Database,
  CheckCircle2
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'live-monitoring'
  | 'inspection'
  | 'defects'
  | 'rework'
  | 'analytics'
  | 'lines'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openDefectsCount?: number;
  activeReworkCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openDefectsCount = 18,
  activeReworkCount = 5
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Control Dashboard',
      icon: LayoutGrid
    },
    {
      id: 'live-monitoring' as ActiveTab,
      label: 'Live Line Monitoring',
      icon: Radio
    },
    {
      id: 'inspection' as ActiveTab,
      label: 'Digital Inspection',
      icon: ClipboardCheck
    },
    {
      id: 'defects' as ActiveTab,
      label: 'Defect Registry',
      icon: AlertTriangle,
      badge: openDefectsCount > 0 ? `${openDefectsCount}` : undefined
    },
    {
      id: 'rework' as ActiveTab,
      label: 'Rework & Root Cause',
      icon: Wrench,
      badge: activeReworkCount > 0 ? `${activeReworkCount}` : undefined
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Quality Analytics',
      icon: TrendingUp
    },
    {
      id: 'lines' as ActiveTab,
      label: 'Assembly Lines',
      icon: GitBranch
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Reports & Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between p-4 shrink-0 shadow-sm min-h-[calc(100vh-72px)]">
      <div className="space-y-1.5">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#EAF2FF] text-[#1685F8] shadow-sm font-bold'
                    : 'text-[#64748B] hover:text-[#18345F] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1685F8]' : 'text-[#64748B]'}`} />
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#1685F8] text-white'
                        : 'bg-slate-100 text-[#64748B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Database & System Info Footer */}
      <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
        <div className="p-3 rounded-xl bg-[#F5F9FE] border border-[#E2E8F0] text-[11px] font-sans">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center space-x-1.5 font-bold text-[#18345F]">
              <Database className="w-3.5 h-3.5 text-[#1685F8]" />
              <span>Database Storage</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
              SAVED
            </span>
          </div>
          <p className="text-[10px] text-[#64748B]">
            Permanent disk persistence in <span className="font-mono text-slate-700">automotive_db.json</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
