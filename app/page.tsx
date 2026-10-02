'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0c0d0e] flex items-center justify-center font-sans text-xs text-neutral-400">
      <div className="flex items-center gap-2.5">
        <div className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading archive...</span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <App />;
}
