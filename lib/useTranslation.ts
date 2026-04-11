import { useParams } from 'next/navigation';
import { messages } from './translations';

type Namespace = keyof typeof messages.ar;

export function useTranslation(namespace: Namespace = 'common') {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const translations = messages[locale as keyof typeof messages]?.[namespace] || messages.ar[namespace] || {};

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let text = (translations as any)[key];
    if (!text) return key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return { t, locale };
}