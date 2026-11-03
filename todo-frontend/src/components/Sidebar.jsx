import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  UserCheck,
  Users,
  FileText,
  MessageSquare,
  Mail,
  CheckSquare,
  User,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  activeApp = 'todo',
  activeView = 'list',
  onNavigate,
}) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900 tracking-tight">CakeAdmin</span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                  UKK
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 mx-4 my-3 bg-gradient-to-r from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Timotheus Bendan"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-800 truncate">Timotheus Bendan</h4>
            <p className="text-[11px] text-slate-500 font-medium">Admin • PPLG SMK</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 text-xs font-medium text-slate-600">
          {/* Dashboard Section */}
          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Dashboard
            </span>
            <ul className="mt-2 space-y-1">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-4 h-4 text-slate-400" />
                    <span>Orders</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>Products</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>Buyer</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Customers</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Invoices</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
            </ul>
          </div>

          {/* Apps Section */}
          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Apps
            </span>
            <ul className="mt-2 space-y-1">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span>Chats</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    2
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>Email App</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>

              {/* Todo App (Active) */}
              <li className="pt-1">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl text-indigo-700 font-semibold bg-indigo-50/60">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    <span>Todo App</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500 rotate-90" />
                </div>

                {/* Submenu: List & Details */}
                <div className="pl-9 pr-2 py-1.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('list')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeView === 'list'
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                    }`}
                  >
                    List
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('details')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeView === 'details'
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                    }`}
                  >
                    Details
                  </button>
                </div>
              </li>
            </ul>
          </div>

          {/* Pages Section */}
          <div>
            <span className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Pages
            </span>
            <ul className="mt-2 space-y-1">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          UKK PPLG SMK • Fullstack Todo
        </div>
      </aside>
    </>
  );
}

