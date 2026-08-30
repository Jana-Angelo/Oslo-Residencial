import React from 'react';
import {Download} from 'lucide-react';
import {usePWAInstall} from '../../hooks/usePWAInstall';

interface Props {
  onClose?: () => void;
}

export default function InstallPWAButton({onClose}: Props) {
  const {standalone, installNow} = usePWAInstall();

  if (standalone) return null;

  const handleClick = async () => {
    const accepted = await installNow();
    if (accepted) onClose?.();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold text-[#6E6157] hover:bg-[#F5F2EB] cursor-pointer text-left"
    >
      <Download className="w-4 h-4 text-[#8C7364]" />
      Instalar app
    </button>
  );
}