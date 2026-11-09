import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Mode hors-ligne actif — Les données en cache et formulaires restent disponibles.</span>
    </div>
  );
};
