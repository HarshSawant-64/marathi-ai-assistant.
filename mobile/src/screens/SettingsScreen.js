import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, View } from 'react-native';

import Text from '../components/AccessibleText';
import LanguagePicker from '../components/LanguagePicker';

export default function SettingsScreen({ language, strings, largeText, highContrast, onLargeTextChange, onHighContrastChange, onLanguageChange, onOpenStatus, onBack }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={strings.back} style={styles.backButton}>
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">{strings.settings}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{strings.language}</Text>
        <LanguagePicker language={language} onChange={onLanguageChange} compact />
        <Text style={styles.helpText}>{strings.languageHelp}</Text>

        <Text style={styles.sectionTitle}>{strings.accessibility}</Text>
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceCopy}>
            <Text style={styles.preferenceTitle}>{strings.largeText}</Text>
            <Text style={styles.preferenceBody}>{strings.largeTextHelp}</Text>
          </View>
          <Switch
            value={largeText}
            onValueChange={onLargeTextChange}
            accessibilityRole="switch"
            accessibilityLabel={strings.largeText}
            trackColor={{ false: '#C7CBD5', true: '#A39BF2' }}
            thumbColor={largeText ? '#5144D0' : '#FFFFFF'}
          />
        </View>
        <View style={styles.preferenceCard}>
          <View style={styles.preferenceCopy}>
            <Text style={styles.preferenceTitle}>{strings.highContrast}</Text>
            <Text style={styles.preferenceBody}>{strings.highContrastHelp}</Text>
          </View>
          <Switch
            value={highContrast}
            onValueChange={onHighContrastChange}
            accessibilityRole="switch"
            accessibilityLabel={strings.highContrast}
            trackColor={{ false: '#C7CBD5', true: '#A39BF2' }}
            thumbColor={highContrast ? '#5144D0' : '#FFFFFF'}
          />
        </View>

        <Pressable onPress={onOpenStatus} accessibilityRole="button" style={styles.statusCard}>
          <View style={styles.statusIcon}><Text style={styles.statusIconText}>◉</Text></View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusTitle}>{strings.status}</Text>
            <Text style={styles.statusSubtitle}>{strings.providerNotReady}</Text>
          </View>
          <Text style={styles.forward}>→</Text>
        </Pressable>

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>{strings.privacy}</Text>
          <Text style={styles.privacyBody}>{strings.footer} {strings.noExternalCalls}</Text>
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutLabel}>{strings.prototype}</Text>
          <Text style={styles.aboutName}>{strings.brand}</Text>
          <Text style={styles.aboutCopy}>{strings.mockModeDetail}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { height: 62, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EAECF2' },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center' },
  backGlyph: { color: '#353E53', fontSize: 22 },
  headerTitle: { color: '#172033', fontSize: 17, fontWeight: '800' },
  content: { padding: 20, paddingBottom: 30, maxWidth: 680, width: '100%', alignSelf: 'center' },
  sectionTitle: { color: '#263047', fontSize: 15, fontWeight: '800', marginBottom: 12 },
  helpText: { color: '#727B8F', fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 22 },
  preferenceCard: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EBF2', marginBottom: 9 },
  preferenceCopy: { flex: 1 },
  preferenceTitle: { color: '#293248', fontSize: 14, fontWeight: '800' },
  preferenceBody: { color: '#566178', fontSize: 12, lineHeight: 17, marginTop: 4 },
  statusCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9EBF2' },
  statusIcon: { width: 39, height: 39, borderRadius: 14, backgroundColor: '#F0EEFF', alignItems: 'center', justifyContent: 'center' },
  statusIconText: { color: '#5B4DE6', fontSize: 19 },
  statusCopy: { flex: 1 },
  statusTitle: { color: '#293248', fontSize: 14, fontWeight: '800' },
  statusSubtitle: { color: '#7B8396', fontSize: 11, marginTop: 4 },
  forward: { color: '#7B8396', fontSize: 20 },
  privacyCard: { marginTop: 14, padding: 16, borderRadius: 18, backgroundColor: '#EFF7F3', borderColor: '#DFECE7', borderWidth: 1 },
  privacyTitle: { color: '#174B3A', fontSize: 14, fontWeight: '800' },
  privacyBody: { color: '#426A5A', fontSize: 12, lineHeight: 18, marginTop: 7 },
  aboutCard: { marginTop: 24, alignItems: 'center', paddingVertical: 17 },
  aboutLabel: { color: '#9097A7', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  aboutName: { color: '#263047', fontSize: 16, fontWeight: '800', marginTop: 7 },
  aboutCopy: { color: '#7B8396', fontSize: 11, marginTop: 4 },
});
