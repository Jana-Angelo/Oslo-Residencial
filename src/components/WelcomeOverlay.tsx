import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone,
  CreditCard,
  ThumbsUp,
  ArrowRight,
  X,
  Building2,
} from 'lucide-react';

const STORAGE_KEY = 'oslo_welcome_seen';

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markWelcomeSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true');
  } catch {}
}

interface WelcomeOverlayProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Megaphone,
    title: 'Avisos e Comunicados',
    description: 'Fique por dentro de todos os avisos do condomínio. Reuniões, obras, eventos — tudo em um só lugar.',
    color: 'bg-amber-100',
    iconColor: 'text-amber-700',
  },
  {
    icon: CreditCard,
    title: 'Caixa do Prédio',
    description: 'Acompanhe as finanças do condomínio com transparência. Pagamentos, despesas e fluxo mensal.',
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    icon: ThumbsUp,
    title: 'IndicaApt',
    description: 'Descubra prestadores recomendados por seus vizinhos. Compartilhe boas descobertas com a comunidade.',
    color: 'bg-violet-100',
    iconColor: 'text-violet-700',
  },
];

export default function WelcomeOverlay({ onComplete }: WelcomeOverlayProps) {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      markWelcomeSeen();
      onComplete();
    }, 300);
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3E342F]/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 pt-8 pb-4 text-center">
              <button
                onClick={handleComplete}
                className="absolute top-4 right-4 p-2 text-[#A6978A] hover:text-[#3E342F] hover:bg-[#F5F2EB] rounded-full transition-colors cursor-pointer"
                aria-label="Pular introdução"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#8C7364] text-white rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-[#3E342F] tracking-tight font-display">
                  Oslo Residencial
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={`w-16 h-16 ${current.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                    <Icon className={`w-8 h-8 ${current.iconColor}`} />
                  </div>

                  <h2 className="text-xl font-extrabold text-[#3E342F] tracking-tight font-display mb-2">
                    {current.title}
                  </h2>
                  <p className="text-sm text-[#6E6157] leading-relaxed px-2">
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? 'w-6 bg-[#8C7364]'
                        : i < step
                        ? 'w-1.5 bg-[#8C7364]/40'
                        : 'w-1.5 bg-[#EAE3D5]'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold text-sm py-3.5 rounded-xl transition-colors cursor-pointer"
              >
                <span>{step < STEPS.length - 1 ? 'Próximo' : 'Começar'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {step < STEPS.length - 1 && (
                <button
                  onClick={handleComplete}
                  className="w-full text-center text-xs text-[#A6978A] hover:text-[#6E6157] font-bold mt-3 py-1 transition-colors cursor-pointer"
                >
                  Pular introdução
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
