"use client";

import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="btn-glow text-xs flex items-center gap-1 px-2 py-1 h-8"
      title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a inglés'}
    >
      <Languages className="w-3 h-3" />
      <span className="font-medium">
        {language === 'en' ? 'ES' : 'EN'}
      </span>
    </Button>
  );
} 