import { useCallback, useEffect, useMemo, useState } from 'react';
import { SettingsState, WebsiteCredential } from '../types';

const STORAGE_KEY = 'saas-listicle-generator-settings-v1';

const defaultState: SettingsState = {
  geminiApiKey: '',
  ideogramApiKey: '',
  websites: []
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultState, ...JSON.parse(stored) } as SettingsState;
      }
    } catch (error) {
      console.warn('Failed to parse stored settings', error);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to persist settings', error);
    }
  }, [settings]);

  const updateSettings = useCallback(
    (partial: Partial<SettingsState>) => {
      setSettings(prev => ({ ...prev, ...partial }));
    },
    []
  );

  const addWebsite = useCallback((website: Omit<WebsiteCredential, 'id'>) => {
    setSettings(prev => ({
      ...prev,
      websites: [
        ...prev.websites,
        {
          id: crypto.randomUUID(),
          ...website
        }
      ]
    }));
  }, []);

  const updateWebsite = useCallback((id: string, website: Partial<WebsiteCredential>) => {
    setSettings(prev => ({
      ...prev,
      websites: prev.websites.map(item => (item.id === id ? { ...item, ...website } : item))
    }));
  }, []);

  const removeWebsite = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      websites: prev.websites.filter(item => item.id !== id)
    }));
  }, []);

  const derived = useMemo(
    () => ({
      hasCredentials: Boolean(settings.geminiApiKey && settings.ideogramApiKey),
      hasWebsites: settings.websites.length > 0
    }),
    [settings.geminiApiKey, settings.ideogramApiKey, settings.websites.length]
  );

  return {
    settings,
    updateSettings,
    addWebsite,
    updateWebsite,
    removeWebsite,
    derived
  };
}
