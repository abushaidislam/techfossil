import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DevBanner } from './components/layout/DevBanner';
import { KeyboardShortcutsModal } from './components/layout/KeyboardShortcutsModal';
import { SearchModal } from './components/search/SearchModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Views
import { HomeView } from './views/HomeView';
import { ArchiveView } from './views/ArchiveView';
import { TechnologiesView } from './views/TechnologiesView';
import { TechnologyDetailView } from './views/TechnologyDetailView';
import { SignalDetailView } from './views/SignalDetailView';
import { GlobalTimelineView } from './views/GlobalTimelineView';
import { KnowledgeGraphView } from './views/KnowledgeGraphView';
import { DigestView } from './views/DigestView';
import { DashboardView } from './views/DashboardView';
import { IngestionControlView } from './views/IngestionControlView';
import { DatasetView } from './views/DatasetView';
import { DocsView } from './views/DocsView';
import { ResearchView } from './views/ResearchView';
import { SecurityView } from './views/SecurityView';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const [selectedTechSlug, setSelectedTechSlug] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Sync with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash || hash === 'home') {
        setCurrentView('home');
        setSelectedSignalId(null);
        setSelectedTechSlug(null);
        return;
      }

      if (hash.startsWith('signal/')) {
        const id = hash.replace('signal/', '');
        setSelectedSignalId(id);
        setCurrentView('signal-detail');
      } else if (hash.startsWith('technology/')) {
        const slug = hash.replace('technology/', '');
        setSelectedTechSlug(slug);
        setCurrentView('technology-detail');
      } else {
        const viewAliases: Record<string, string> = {
          signals: 'archive',
          tech: 'technologies',
          metrics: 'dashboard',
          cve: 'security',
          papers: 'research',
          telemetry: 'dashboard',
        };
        setCurrentView(viewAliases[hash] || hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view: string, param?: string) => {
    if (view === 'home') {
      window.location.hash = '#/';
      setCurrentView('home');
      setSelectedSignalId(null);
      setSelectedTechSlug(null);
    } else if (view === 'signal' && param) {
      window.location.hash = `#/signal/${param}`;
      setSelectedSignalId(param);
      setCurrentView('signal-detail');
    } else if (view === 'technology' && param) {
      window.location.hash = `#/technology/${param}`;
      setSelectedTechSlug(param);
      setCurrentView('technology-detail');
    } else {
      window.location.hash = `#/${view}`;
      setCurrentView(view);
      setSelectedSignalId(null);
      setSelectedTechSlug(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useKeyboardShortcuts({
    onOpenSearch: () => setIsSearchOpen(true),
    onOpenShortcuts: () => setIsShortcutsOpen(true),
    onNavigate: navigateTo,
  });

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#ededed] flex flex-col font-sans selection:bg-[#2e3135] selection:text-white">
      {/* Development dataset disclosure banner */}
      <DevBanner />

      {/* Global Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4">
        {currentView === 'home' && (
          <HomeView
            onNavigate={navigateTo}
            onSelectSignal={(id) => navigateTo('signal', id)}
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {currentView === 'archive' && (
          <ArchiveView
            onSelectSignal={(id) => navigateTo('signal', id)}
          />
        )}

        {currentView === 'technologies' && (
          <TechnologiesView
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
          />
        )}

        {currentView === 'technology-detail' && selectedTechSlug && (
          <TechnologyDetailView
            slug={selectedTechSlug}
            onBack={() => navigateTo('technologies')}
            onSelectSignal={(id) => navigateTo('signal', id)}
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
          />
        )}

        {currentView === 'signal-detail' && selectedSignalId && (
          <SignalDetailView
            signalId={selectedSignalId}
            onBack={() => navigateTo('archive')}
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
            onSelectSignal={(id) => navigateTo('signal', id)}
          />
        )}

        {currentView === 'timeline' && (
          <GlobalTimelineView
            onSelectSignal={(id) => navigateTo('signal', id)}
          />
        )}

        {currentView === 'graph' && (
          <KnowledgeGraphView
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
          />
        )}

        {currentView === 'digest' && (
          <DigestView
            onSelectSignal={(id) => navigateTo('signal', id)}
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardView onNavigate={navigateTo} />
        )}

        {currentView === 'ingestion' && (
          <IngestionControlView
            onSelectSignal={(id) => navigateTo('signal', id)}
          />
        )}

        {currentView === 'dataset' && <DatasetView />}

        {currentView === 'docs' && <DocsView />}

        {currentView === 'research' && (
          <ResearchView
            onSelectSignal={(id) => navigateTo('signal', id)}
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
          />
        )}

        {currentView === 'security' && (
          <SecurityView
            onSelectSignal={(id) => navigateTo('signal', id)}
            onSelectTechnology={(slug) => navigateTo('technology', slug)}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Search & AI Research Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectSignal={(id) => {
          setIsSearchOpen(false);
          navigateTo('signal', id);
        }}
        onSelectTechnology={(slug) => {
          setIsSearchOpen(false);
          navigateTo('technology', slug);
        }}
      />

      {/* Keyboard Shortcuts Cheat-sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
