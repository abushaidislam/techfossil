import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0a0b0d] text-neutral-400 text-xs py-14 px-4 sm:px-6 mt-24 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border border-white/20 bg-neutral-900 flex items-center justify-center font-sans font-bold text-xs text-white">
              TF
            </div>
            <span className="font-semibold text-white tracking-tight font-sans text-sm">TechFossil</span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
            Preserving the evolution of technology. An open-source, continuously growing historical archive of software, AI, research, security, and developer ecosystem changes.
          </p>
          <div className="text-[11px] text-neutral-400 pt-1 font-sans">
            CC0 1.0 Universal & MIT Open Source License
          </div>
        </div>

        <div>
          <h4 className="text-neutral-200 font-sans text-xs font-semibold mb-3">Intelligence</h4>
          <ul className="space-y-2 text-neutral-400">
            <li><button onClick={() => onNavigate('archive')} className="hover:text-white transition-colors">Signals archive</button></li>
            <li><button onClick={() => onNavigate('technologies')} className="hover:text-white transition-colors">Technology directory</button></li>
            <li><button onClick={() => onNavigate('timeline')} className="hover:text-white transition-colors">Historical timelines</button></li>
            <li><button onClick={() => onNavigate('graph')} className="hover:text-white transition-colors">Knowledge graph</button></li>
            <li><button onClick={() => onNavigate('digest')} className="hover:text-white transition-colors">Daily & monthly digests</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-neutral-200 font-sans text-xs font-semibold mb-3">Domains</h4>
          <ul className="space-y-2 text-neutral-400">
            <li><button onClick={() => onNavigate('research')} className="hover:text-white transition-colors">arXiv research papers</button></li>
            <li><button onClick={() => onNavigate('security')} className="hover:text-white transition-colors">Security advisories (CVE)</button></li>
            <li><button onClick={() => onNavigate('dataset')} className="hover:text-white transition-colors">Public dataset downloads</button></li>
            <li><button onClick={() => onNavigate('ingestion')} className="hover:text-white transition-colors">Ingestion control & logs</button></li>
            <li><button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">System metrics</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-neutral-200 font-sans text-xs font-semibold mb-3">Governance</h4>
          <ul className="space-y-2 text-neutral-400">
            <li><button onClick={() => onNavigate('docs')} className="hover:text-white transition-colors">Architecture specification</button></li>
            <li><button onClick={() => onNavigate('docs')} className="hover:text-white transition-colors">Data model & evidence rules</button></li>
            <li><button onClick={() => onNavigate('docs')} className="hover:text-white transition-colors">REST API reference</button></li>
            <li><a href="https://github.com/techfossil/archive" target="_blank" rel="noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-1">GitHub repository <ExternalLink className="w-3 h-3" /></a></li>
            <li><button onClick={() => onNavigate('docs')} className="hover:text-white transition-colors">Contributing guidelines</button></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-sans text-neutral-400">
        <div>
          TechFossil Archive © 2026. A non-commercial public technology documentation initiative.
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <span>Source-grounded facts</span>
          <span>•</span>
          <span>Immutable records</span>
        </div>
      </div>
    </footer>
  );
};
