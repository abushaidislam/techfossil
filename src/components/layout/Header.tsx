import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Github,
  Network,
  Activity,
  Database,
  Terminal,
  FileText,
  HelpCircle,
  Menu,
  X,
  Layers,
  Archive,
  Calendar,
  BookOpen,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface Props {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenShortcuts,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary top links
  const primaryLinks = [
    { id: 'archive', label: 'Archive' },
    { id: 'technologies', label: 'Technologies' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'research', label: 'Research' },
    { id: 'security', label: 'Security' },
  ];

  // Secondary destinations grouped category-wise for dropdown
  const dropdownCategories = [
    {
      title: 'Intelligence & Graph',
      items: [
        {
          id: 'graph',
          label: 'Knowledge Graph',
          desc: 'Interactive entity relationships & dependencies',
          icon: Network,
        },
        {
          id: 'digest',
          label: 'Daily Digest',
          desc: 'Curated daily summaries & ecosystem patterns',
          icon: Activity,
        },
      ],
    },
    {
      title: 'Data & Infrastructure',
      items: [
        {
          id: 'dataset',
          label: 'Public Datasets',
          desc: 'Downloadable JSON, JSONL, CSV & Markdown records',
          icon: Database,
        },
        {
          id: 'ingestion',
          label: 'Ingestion Control',
          desc: 'Automated 14-stage pipeline & live logs',
          icon: Terminal,
        },
        {
          id: 'dashboard',
          label: 'System Metrics',
          desc: 'Telemetry, volume trends & verification rates',
          icon: Layers,
        },
      ],
    },
    {
      title: 'Specifications & Governance',
      items: [
        {
          id: 'docs',
          label: 'Documentation & API',
          desc: 'Architecture specs, evidence model & REST API',
          icon: FileText,
        },
      ],
    },
  ];

  const isMoreActive = [
    'graph',
    'digest',
    'dataset',
    'ingestion',
    'dashboard',
    'docs',
  ].includes(currentView);

  return (
    <header className="sticky top-0 z-40 bg-[#0d0e10]/95 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Brand identity - calm, archival, Google Sans typography */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-7 h-7 rounded border border-white/15 bg-[#141518] flex items-center justify-center font-sans font-bold text-xs tracking-tight text-white group-hover:border-white/30 transition-colors shadow-sm">
              TF
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-tight text-white font-sans text-sm leading-tight">
                TechFossil
              </span>
              <span className="text-[11px] text-neutral-400 font-sans tracking-normal -mt-0.5">
                Technology archive
              </span>
            </div>
          </button>

          {/* Primary Navigation - restrained, uncluttered, sentence case */}
          <nav className="hidden md:flex items-center gap-1 font-sans text-[13px]">
            {primaryLinks.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors relative ${
                    isActive
                      ? 'text-white bg-white/[0.08] shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-amber-400/80 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Categorized Dropdown "More" */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  isMoreActive || dropdownOpen
                    ? 'text-white bg-white/[0.08]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-white' : 'text-neutral-400'
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#121316] border border-white/[0.1] rounded-lg shadow-2xl py-3 z-50 animate-in fade-in duration-150">
                  <div className="space-y-4 px-2">
                    {dropdownCategories.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-1">
                        <div className="px-3 py-1 text-[11px] font-sans font-medium text-neutral-400 tracking-wider">
                          {group.title}
                        </div>
                        <div className="space-y-0.5">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentView === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  onNavigate(item.id);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full flex items-start gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                                  isActive
                                    ? 'bg-white/[0.08] text-white'
                                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.04]'
                                }`}
                              >
                                <Icon className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                                <div>
                                  <div className="text-xs font-semibold text-neutral-100">
                                    {item.label}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 font-normal leading-snug">
                                    {item.desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Controls: Search, GitHub, Shortcuts, Mobile toggle */}
        <div className="flex items-center gap-2.5">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-[#141518] hover:bg-[#1a1b1f] text-neutral-400 hover:text-neutral-200 border border-white/[0.08] px-2.5 py-1.5 rounded-md text-xs font-sans transition-all focus:outline-none"
            title="Search archive (/)"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline text-neutral-400 text-xs">Search</span>
            <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] bg-neutral-800 text-neutral-400 px-1 py-0.2 rounded border border-neutral-700">
              /
            </kbd>
          </button>

          {/* GitHub Repository link */}
          <a
            href="https://github.com/techfossil/archive"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Keyboard Shortcuts Dialog */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts (?)"
            className="hidden sm:inline-flex p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-md md:hidden text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#111215] px-4 py-4 space-y-4">
          <div className="space-y-1">
            <div className="text-[11px] font-sans font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1">
              Primary Archive
            </div>
            {primaryLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium ${
                  currentView === item.id
                    ? 'bg-white/[0.1] text-white'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {dropdownCategories.map((group, idx) => (
            <div key={idx} className="space-y-1 pt-2 border-t border-white/[0.06]">
              <div className="text-[11px] font-sans font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-1">
                {group.title}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center justify-between ${
                    currentView === item.id
                      ? 'bg-white/[0.1] text-white'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-neutral-400">{item.desc}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
