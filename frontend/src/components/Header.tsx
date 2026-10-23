import React, { useState, useEffect } from 'react';
import {
  Car,
  Calendar,
  Search,
  Bell,
  ChevronDown,
  User,
  CheckCircle2,
  AlertTriangle,
  Radio,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { socketClient } from '../services/socket';
import { User as UserType } from '../types';

interface HeaderProps {
  onSearch?: (query: string) => void;
  currentShift?: string;
  onShiftChange?: (shift: any) => void;
  onOpenNewVehicleModal?: () => void;
  currentUser?: UserType | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  currentShift = 'Shift A (Morning)',
  onShiftChange,
  onOpenNewVehicleModal,
  currentUser,
  onLogout
}) => {

  const [currentDateTime, setCurrentDateTime] = useState<string>('21 Oct 2026 16:48');
  const [wsStatus, setWsStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED'>('CONNECTED');
  const [searchVal, setSearchVal] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as "21 Oct 2026 16:48"
      const day = now.getDate();
      const month = now.toLocaleString('en-US', { month: 'short' });
      const year = now.getFullYear();
      const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      setCurrentDateTime(`${day} ${month} ${year} ${time}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);

    const unsub = socketClient.onConnectionChange(status => {
      setWsStatus(status);
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="h-[72px] bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5">
          {/* AutoQC Car Logo */}
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] border border-[#DBEAFE] flex items-center justify-center text-[#1685F8]">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1685F8"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#1685F8] font-sans">
            Auto<span className="text-[#18345F]">QC</span>
          </span>
        </div>

        <div className="hidden xl:block h-8 w-[1px] bg-slate-200" />

        <p className="hidden xl:block text-[11px] leading-tight text-[#64748B] max-w-sm font-sans">
          Real-Time Assembly-Line Defect Monitoring and Quality Analytics Platform for Automotive Manufacturing
        </p>
      </div>

      {/* Middle & Right Controls */}
      <div className="flex items-center space-x-4 sm:space-x-5">
        {/* Live Monitoring Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#D1FAE5] text-[11px] font-bold text-[#10B981] font-sans">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="tracking-wide uppercase">LIVE MONITORING</span>
        </div>

        {/* Date and Time */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-[#64748B] font-medium font-sans">
          <Calendar className="w-4 h-4 text-[#1685F8]" />
          <span>{currentDateTime}</span>
        </div>

        {/* Search Input */}
        <div className="relative hidden md:block">
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-44 lg:w-56 bg-[#F5F9FE] border border-[#E2E8F0] text-xs text-[#18345F] placeholder-slate-400 rounded-full pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#1685F8] focus:bg-white transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-[#F5F9FE] border border-[#E2E8F0] hover:bg-[#EAF2FF] flex items-center justify-center text-[#64748B] hover:text-[#1685F8] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 p-3 text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-[#18345F]">Recent Quality Alerts</span>
                <span className="text-[10px] text-[#1685F8] font-semibold">3 Unread</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-700">
                  <p className="font-semibold">Critical Defect at Assembly 03</p>
                  <p className="text-[11px] text-red-600">Panel misalignment on D-1042</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-700">
                  <p className="font-semibold">Station 2 Paint Attention</p>
                  <p className="text-[11px] text-amber-600">Throughput dropped to 266/hr (Target 280/hr)</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <p className="font-semibold">Rework Completed</p>
                  <p className="text-[11px] text-emerald-600">Surface scratch verified at Paint 02</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2.5 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-[#18345F] flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {currentUser?.avatarInitials || 'AD'}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-[#18345F] block leading-tight">
                {currentUser?.name || 'Adithya'}
              </span>
              <span className="text-[10px] text-[#64748B] block leading-none">
                {currentUser?.role === 'PLANT_ADMIN' ? 'Director' : currentUser?.role === 'INSPECTOR' ? 'QA Inspector' : 'Rework Lead'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 p-2 text-xs font-sans animate-fadeIn">
              <div className="px-3 py-2.5 border-b border-slate-100 bg-[#F8FAFC] rounded-lg mb-1">
                <p className="font-bold text-[#18345F]">{currentUser?.name || 'Plant Administrator'}</p>
                <p className="text-[11px] text-[#1685F8] font-semibold">{currentUser?.title || 'Plant Quality Director'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{currentUser?.email || 'admin@autoqc.plant4.com'}</p>
                {currentUser?.stationOrLine && (
                  <p className="text-[10px] text-slate-500 font-medium mt-1 inline-flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                    <span>📍</span>
                    <span>{currentUser.stationOrLine}</span>
                  </p>
                )}
              </div>
              <div className="py-1 space-y-0.5">
                {onOpenNewVehicleModal && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenNewVehicleModal();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#F5F9FE] text-[#1685F8] font-bold rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>+ Launch New VIN</span>
                  </button>
                )}
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F5F9FE] text-[#18345F] rounded-lg transition-colors cursor-pointer"
                >
                  Plant Configuration
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F5F9FE] text-[#18345F] rounded-lg transition-colors cursor-pointer"
                >
                  Audit Logs
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F5F9FE] text-[#1685F8] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  System Status
                </button>
              </div>

              {/* Logout Action */}
              {onLogout && (
                <div className="pt-1.5 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
