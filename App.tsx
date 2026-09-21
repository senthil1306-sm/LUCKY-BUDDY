import React, { useState, useCallback } from 'react';
import { AppSettings, BuddyId } from './mascots/types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Mascot } from './components/Mascot';
import { AmbientCanvas } from './components/AmbientCanvas';
import { SettingsPanel } from './components/SettingsPanel';
import { Onboarding } from './components/Onboarding';
import { playBellChime } from './utils/sound';

const DEFAULT_SETTINGS: AppSettings = {
  buddyId: 'lucky-bear',
  positionPreset: 'right',
  customPercentX: 82, // Starts near top-right corner as specified in Section 2
  soundEnabled: false, // Default sound OFF per Section 15
  animationEnabled: true,
  messageFrequency: 'medium',
  ambientTheme: 'minimal',
  onboarded: false
};

export const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AppSettings>('lucky_buddy_settings_v1', DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Partial settings updater
  const handleUpdateSettings = useCallback((newPartial: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newPartial
    }));
  }, [setSettings]);

  // Reset to factory defaults
  const handleResetSettings = useCallback(() => {
    setSettings({
      ...DEFAULT_SETTINGS,
      onboarded: true // keep them in app after reset
    });
  }, [setSettings]);

  // Handle onboarding completion
  const handleCompleteOnboarding = useCallback(() => {
    handleUpdateSettings({ onboarded: true });
    // Play a welcoming sound if enabled, or simple gentle chime
    playBellChime(0.12);
  }, [handleUpdateSettings]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#FAF8F5]">
      {/* Clean Full-Screen Ambient Background */}
      <AmbientCanvas
        theme={settings.ambientTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Hero Hanging Mascot Experience */}
      <Mascot
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetSettings={handleResetSettings}
      />

      {/* Full Settings Panel Dialog */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onReset={handleResetSettings}
        onPlayTestSound={() => playBellChime(0.18)}
      />

      {/* First-time Onboarding Experience (Section 23) */}
      {!settings.onboarded && (
        <Onboarding
          selectedBuddyId={settings.buddyId}
          onSelectBuddy={(id: BuddyId) => handleUpdateSettings({ buddyId: id })}
          onComplete={handleCompleteOnboarding}
        />
      )}
    </main>
  );
};

export default App;
