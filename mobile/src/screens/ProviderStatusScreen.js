import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import Text from '../components/AccessibleText';
import { hasBackendUrl, requestProviderStatus } from '../services/api';

export default function ProviderStatusScreen({ strings, onBack }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshStatus() {
    setLoading(true);
    setError(false);
    try {
      setStatus(await requestProviderStatus());
    } catch (_statusError) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  const providerList = [
    { key: 'gemini', name: 'Gemini' },
    { key: 'grok', name: strings.grokFallback },
  ];
  const modeTitle = status?.mode === 'live'
    ? strings.liveMode
    : status?.mode === 'unavailable'
      ? strings.providerUnavailable
      : strings.mockMode;
  const modeSubtitle = status?.mode === 'live'
    ? strings.liveModeDetail
    : status?.mode === 'unavailable'
      ? strings.providerNotReadyDetail
      : strings.mockModeDetail;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={strings.back} style={styles.backButton}>
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} accessibilityRole="header">{strings.status}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.modeCard}>
          <View style={styles.modeIcon}><Text style={styles.modeIconText}>✓</Text></View>
          <View style={styles.modeCopy}>
            <Text style={styles.modeTitle}>{modeTitle}</Text>
            <Text style={styles.modeSubtitle}>{modeSubtitle}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{strings.providerNotReady}</Text>
        <Text style={styles.sectionCopy}>{strings.providerNotReadyDetail}</Text>

        {loading ? (
          <View style={styles.loading}><ActivityIndicator color="#5B4DE6" /><Text style={styles.loadingText}>{strings.status}…</Text></View>
        ) : null}
        {error ? <Text style={styles.errorText} accessibilityLiveRegion="assertive">{strings.error}</Text> : null}

        {status ? providerList.map((provider) => {
          const providerStatus = status.providers?.[provider.key];
          const available = Boolean(providerStatus?.available);
          const configuredButDisabled = Boolean(providerStatus?.configured && !available && status.mode === 'mock');
          const configuredButUnavailable = Boolean(providerStatus?.configured && !available && status.mode !== 'mock');
          const providerDetail = available
            ? strings.providerReady
            : configuredButDisabled
              ? strings.configuredButMock
              : configuredButUnavailable
                ? strings.providerConfiguredUnavailable
                : strings.notConnected;
          return (
            <View key={provider.key} style={styles.providerCard}>
              <View style={styles.providerIcon}><Text style={styles.providerGlyph}>{provider.key === 'gemini' ? 'G' : 'x'}</Text></View>
              <View style={styles.providerCopy}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <Text style={styles.providerDetail}>{providerDetail}</Text>
              </View>
              <View style={[styles.statusPill, available && styles.availablePill]}>
                <View style={[styles.statusDot, available && styles.availableDot]} />
                <Text style={[styles.statusPillText, available && styles.availableText]}>{available ? 'READY' : 'OFF'}</Text>
              </View>
            </View>
          );
        }) : null}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{strings.noExternalCalls}</Text>
          <Text style={styles.infoBody}>{hasBackendUrl ? strings.statusPrivacy : strings.localMock}</Text>
        </View>

        <Pressable onPress={refreshStatus} accessibilityRole="button" style={styles.refreshButton}>
          <Text style={styles.refreshText}>{strings.refresh}</Text>
        </Pressable>
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
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 17, borderRadius: 20, backgroundColor: '#EFF7F3', borderColor: '#DFECE7', borderWidth: 1 },
  modeIcon: { width: 40, height: 40, borderRadius: 15, backgroundColor: '#D7EEE3', alignItems: 'center', justifyContent: 'center' },
  modeIconText: { color: '#147B55', fontSize: 19, fontWeight: '900' },
  modeCopy: { flex: 1 },
  modeTitle: { color: '#174B3A', fontSize: 15, fontWeight: '800' },
  modeSubtitle: { color: '#507363', fontSize: 11, marginTop: 4 },
  sectionTitle: { color: '#263047', fontSize: 17, fontWeight: '800', marginTop: 27 },
  sectionCopy: { color: '#727B8F', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 14 },
  loading: { paddingVertical: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
  loadingText: { color: '#727B8F', fontSize: 12 },
  errorText: { color: '#B33A3A', fontSize: 13, marginVertical: 12 },
  providerCard: { minHeight: 72, backgroundColor: '#FFFFFF', borderRadius: 17, borderWidth: 1, borderColor: '#E9EBF2', marginBottom: 10, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  providerIcon: { height: 38, width: 38, borderRadius: 14, backgroundColor: '#F1EFFF', alignItems: 'center', justifyContent: 'center' },
  providerGlyph: { color: '#5B4DE6', fontSize: 17, fontWeight: '900' },
  providerCopy: { flex: 1 },
  providerName: { color: '#293248', fontSize: 14, fontWeight: '800' },
  providerDetail: { color: '#7B8396', fontSize: 11, marginTop: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, backgroundColor: '#F1F2F5' },
  availablePill: { backgroundColor: '#E5F5ED' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9AA1AF' },
  availableDot: { backgroundColor: '#1F9A64' },
  statusPillText: { color: '#7B8291', fontSize: 9, fontWeight: '900' },
  availableText: { color: '#20734E' },
  infoCard: { marginTop: 8, padding: 16, borderRadius: 18, backgroundColor: '#FFFFFF', borderColor: '#E9EBF2', borderWidth: 1 },
  infoTitle: { color: '#313A4F', fontSize: 13, lineHeight: 19, fontWeight: '700' },
  infoBody: { color: '#788094', fontSize: 11, marginTop: 6 },
  refreshButton: { minHeight: 50, borderRadius: 15, backgroundColor: '#5B4DE6', alignItems: 'center', justifyContent: 'center', marginTop: 17 },
  refreshText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
