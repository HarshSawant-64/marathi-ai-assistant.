import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import Text from '../components/AccessibleText';

export default function HomeScreen({ strings, onOpenChat, onOpenSettings, onOpenStatus }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logo}><Text style={styles.logoText}>आ</Text></View>
          <View>
            <Text style={styles.brand}>{strings.brand}</Text>
            <Text style={styles.kicker}>{strings.prototype}</Text>
          </View>
        </View>
        <Pressable onPress={onOpenSettings} accessibilityRole="button" accessibilityLabel={strings.settings} style={styles.settingsButton}>
          <Text style={styles.settingsGlyph}>⚙</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroEyebrow}><View style={styles.liveDot} /><Text style={styles.heroEyebrowText}>{strings.prototype}</Text></View>
          <Text style={styles.greeting} accessibilityRole="header">{strings.homeGreeting}</Text>
          <Text style={styles.subtitle}>{strings.homeSubtitle}</Text>
          <Pressable onPress={onOpenChat} accessibilityRole="button" style={styles.primaryButton}>
            <View style={styles.chatIcon}><Text style={styles.chatIconText}>Aa</Text></View>
            <Text style={styles.primaryButtonText}>{strings.startChat}</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
          <View style={styles.voiceCard}>
            <View style={styles.voiceIcon}><Text style={styles.voiceIconText}>◖</Text></View>
            <View style={styles.voiceCopy}>
              <Text style={styles.voiceTitle}>{strings.voiceSoon}</Text>
              <Text style={styles.voiceSubtitle}>{strings.voiceUnavailable}</Text>
            </View>
            <Text style={styles.lockIcon}>· · ·</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{strings.sampleTitle}</Text>
          <Text style={styles.sectionCount}>01</Text>
        </View>
        <Pressable onPress={onOpenChat} accessibilityRole="button" style={styles.suggestionCard}>
          <View style={styles.suggestionIcon}><Text style={styles.suggestionIconText}>?</Text></View>
          <Text style={styles.suggestionText}>{strings.sourceQuestion}</Text>
          <Text style={styles.suggestionArrow}>↗</Text>
        </Pressable>

        <View style={styles.infoCard}>
          <View style={styles.infoTop}>
            <View style={styles.infoIcon}><Text style={styles.infoIconText}>i</Text></View>
            <Text style={styles.infoTitle}>{strings.officialInfo}</Text>
          </View>
          <Text style={styles.infoBody}>{strings.officialInfoBody}</Text>
          <Text style={styles.infoNotice}>{strings.mockNotice}</Text>
        </View>

        <Pressable onPress={onOpenStatus} accessibilityRole="button" style={styles.statusLink}>
          <Text style={styles.statusText}>{strings.status}</Text>
          <Text style={styles.statusArrow}>→</Text>
        </Pressable>
      </ScrollView>
      <View style={styles.bottomNav}>
        <View style={styles.navItemActive}><Text style={styles.navGlyphActive}>⌂</Text><Text style={styles.navLabelActive}>{strings.home}</Text></View>
        <Pressable onPress={onOpenSettings} accessibilityRole="button" style={styles.navItem}><Text style={styles.navGlyph}>◌</Text><Text style={styles.navLabel}>{strings.settings}</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FC' },
  topBar: { paddingHorizontal: 22, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#EEF0F5', borderBottomWidth: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#5B4DE6', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#FFFFFF', fontSize: 21, fontWeight: '800' },
  brand: { color: '#172033', fontSize: 18, fontWeight: '800' },
  kicker: { color: '#7A8295', fontSize: 9, letterSpacing: 1.1, fontWeight: '800', marginTop: 1 },
  settingsButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#FFFFFF', borderColor: '#E8EAF0', borderWidth: 1 },
  settingsGlyph: { color: '#424A60', fontSize: 22 },
  content: { padding: 20, paddingBottom: 26, maxWidth: 680, width: '100%', alignSelf: 'center' },
  heroCard: { backgroundColor: '#26224F', borderRadius: 26, padding: 22, overflow: 'hidden' },
  heroEyebrow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#393466', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#76D6A7' },
  heroEyebrowText: { color: '#DCD9FF', fontSize: 11, fontWeight: '700' },
  greeting: { color: '#FFFFFF', fontSize: 27, lineHeight: 35, fontWeight: '800', marginTop: 20 },
  subtitle: { color: '#D0CEE4', fontSize: 14, lineHeight: 21, marginTop: 8 },
  primaryButton: { minHeight: 58, backgroundColor: '#7063F0', borderRadius: 17, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 22 },
  chatIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  chatIconText: { color: '#5B4DE6', fontSize: 13, fontWeight: '900' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', flex: 1 },
  arrow: { color: '#FFFFFF', fontSize: 21, fontWeight: '500' },
  voiceCard: { marginTop: 13, paddingHorizontal: 13, paddingVertical: 12, backgroundColor: '#302C5B', borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  voiceIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#413D6D', alignItems: 'center', justifyContent: 'center' },
  voiceIconText: { color: '#C4C1DB', fontSize: 20 },
  voiceCopy: { flex: 1 },
  voiceTitle: { color: '#E4E2F2', fontSize: 12, fontWeight: '700' },
  voiceSubtitle: { color: '#AEACC8', fontSize: 10, marginTop: 3 },
  lockIcon: { color: '#AEACC8', fontSize: 14, letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 11 },
  sectionTitle: { color: '#172033', fontSize: 18, fontWeight: '800' },
  sectionCount: { color: '#8C93A4', fontSize: 12, fontWeight: '800' },
  suggestionCard: { minHeight: 68, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E9EBF2', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  suggestionIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: '#FFF2E7', alignItems: 'center', justifyContent: 'center' },
  suggestionIconText: { color: '#C76D2B', fontSize: 19, fontWeight: '800' },
  suggestionText: { flex: 1, color: '#343D52', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  suggestionArrow: { color: '#727A8E', fontSize: 19 },
  infoCard: { marginTop: 14, padding: 16, borderRadius: 18, backgroundColor: '#F0F6F4', borderWidth: 1, borderColor: '#DFECE7' },
  infoTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoIcon: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#D5EEE2', alignItems: 'center', justifyContent: 'center' },
  infoIconText: { color: '#16734F', fontSize: 13, fontWeight: '900' },
  infoTitle: { color: '#174B3A', fontSize: 14, fontWeight: '800' },
  infoBody: { color: '#426A5A', fontSize: 12, lineHeight: 18, marginTop: 8 },
  infoNotice: { color: '#557166', fontSize: 11, lineHeight: 16, marginTop: 7, fontWeight: '600' },
  statusLink: { paddingVertical: 17, flexDirection: 'row', justifyContent: 'space-between' },
  statusText: { color: '#616A7E', fontSize: 13, fontWeight: '700' },
  statusArrow: { color: '#616A7E', fontSize: 18 },
  bottomNav: { minHeight: 66, backgroundColor: '#FFFFFF', borderTopColor: '#E9EBF1', borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItemActive: { alignItems: 'center', gap: 2, minWidth: 88 },
  navItem: { alignItems: 'center', gap: 2, minWidth: 88 },
  navGlyphActive: { color: '#5B4DE6', fontSize: 22 },
  navGlyph: { color: '#8890A1', fontSize: 21 },
  navLabelActive: { color: '#5144D0', fontSize: 10, fontWeight: '800' },
  navLabel: { color: '#858D9E', fontSize: 10, fontWeight: '700' },
});
