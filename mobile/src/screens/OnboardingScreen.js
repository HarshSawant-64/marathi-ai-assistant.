import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import Text from '../components/AccessibleText';
import LanguagePicker from '../components/LanguagePicker';

export default function OnboardingScreen({ language, strings, onLanguageChange, onContinue }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.brandRow}>
          <View style={styles.logo}><Text style={styles.logoText}>आ</Text></View>
          <View>
            <Text style={styles.brand}>{strings.brand}</Text>
            <Text style={styles.kicker}>{strings.prototype}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.orb}><Text style={styles.orbMark}>अ</Text></View>
          <Text style={styles.title} accessibilityRole="header">{strings.languageLabel}</Text>
          <Text style={styles.subtitle}>{strings.languageHint}</Text>
        </View>

        <LanguagePicker language={language} onChange={onLanguageChange} />

        <View style={styles.privacyCard}>
          <View style={styles.privacyIcon}><Text style={styles.privacyIconText}>✓</Text></View>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>{strings.consentTitle}</Text>
            <Text style={styles.privacyBody}>{strings.consentBody}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{strings.footer}</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <Text style={styles.smallNote}>{strings.consentHint}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={styles.continueButton}
        >
          <Text style={styles.continueText}>{strings.continue}</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FC' },
  page: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 24, maxWidth: 620, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#5B4DE6', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 23, fontWeight: '800' },
  brand: { color: '#172033', fontSize: 20, fontWeight: '800' },
  kicker: { color: '#7A8295', fontSize: 10, letterSpacing: 1.2, fontWeight: '700', marginTop: 2 },
  hero: { alignItems: 'center', paddingTop: 36, paddingBottom: 28 },
  orb: { height: 88, width: 88, borderRadius: 44, backgroundColor: '#EAE7FF', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  orbMark: { color: '#5B4DE6', fontSize: 40, fontWeight: '800' },
  title: { color: '#172033', fontSize: 27, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#687086', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 9 },
  privacyCard: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: 18, backgroundColor: '#EEF7F3', marginTop: 22 },
  privacyIcon: { width: 27, height: 27, borderRadius: 14, backgroundColor: '#D5EEE2', alignItems: 'center', justifyContent: 'center' },
  privacyIconText: { color: '#147B55', fontWeight: '900' },
  privacyCopy: { flex: 1 },
  privacyTitle: { color: '#174B3A', fontSize: 15, fontWeight: '800' },
  privacyBody: { color: '#426A5A', fontSize: 13, lineHeight: 19, marginTop: 4 },
  footer: { paddingTop: 18, paddingBottom: 8, alignItems: 'center' },
  footerText: { color: '#798196', fontSize: 12 },
  bottomBar: { backgroundColor: '#FFFFFF', borderTopColor: '#E9EBF1', borderTopWidth: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 18, alignItems: 'center' },
  smallNote: { color: '#70788B', fontSize: 12, marginBottom: 10 },
  continueButton: { width: '100%', borderRadius: 16, backgroundColor: '#5B4DE6', paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  continueText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  buttonArrow: { color: '#FFFFFF', fontSize: 18 },
});
