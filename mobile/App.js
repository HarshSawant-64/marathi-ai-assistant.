import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { AccessibilityContext } from './src/components/AccessibilityContext';
import { DEFAULT_LANGUAGE } from './src/config/languages';
import { getStrings } from './src/i18n/strings';
import ChatScreen from './src/screens/ChatScreen';
import HomeScreen from './src/screens/HomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ProviderStatusScreen from './src/screens/ProviderStatusScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export default function App() {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [screen, setScreen] = useState('onboarding');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const strings = getStrings(language);
  const accessibility = { textScale: largeText ? 1.25 : 1, highContrast };

  return (
    <AccessibilityContext.Provider value={accessibility}>
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor="#F7F8FC" />
        {screen === 'onboarding' ? (
          <OnboardingScreen
            language={language}
            strings={strings}
            onLanguageChange={setLanguage}
            onContinue={() => setScreen('home')}
          />
        ) : null}
        {screen === 'home' ? (
          <HomeScreen
            strings={strings}
            onOpenChat={() => setScreen('chat')}
            onOpenSettings={() => setScreen('settings')}
            onOpenStatus={() => setScreen('status')}
          />
        ) : null}
        {screen === 'chat' ? <ChatScreen language={language} strings={strings} onBack={() => setScreen('home')} /> : null}
        {screen === 'settings' ? (
          <SettingsScreen
            language={language}
            strings={strings}
            largeText={largeText}
            highContrast={highContrast}
            onLargeTextChange={setLargeText}
            onHighContrastChange={setHighContrast}
            onLanguageChange={setLanguage}
            onOpenStatus={() => setScreen('status')}
            onBack={() => setScreen('home')}
          />
        ) : null}
        {screen === 'status' ? <ProviderStatusScreen strings={strings} onBack={() => setScreen('settings')} /> : null}
      </View>
    </AccessibilityContext.Provider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#F7F8FC' } });
