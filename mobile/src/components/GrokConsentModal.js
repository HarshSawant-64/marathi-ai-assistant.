import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import Text from './AccessibleText';

export default function GrokConsentModal({ visible, strings, onAgree, onGeminiOnly }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onGeminiOnly}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.providerBadge}><Text style={styles.providerBadgeText}>Grok · xAI</Text></View>
          <ScrollView style={styles.disclosure}>
            <Text style={styles.title} accessibilityRole="header">{strings.grokConsentTitle}</Text>
            <Text style={styles.body}>{strings.grokConsentBody}</Text>
          </ScrollView>
          <Pressable onPress={onAgree} accessibilityRole="button" style={styles.agreeButton}>
            <Text style={styles.agreeText}>{strings.allowGrokFallback}</Text>
          </Pressable>
          <Pressable onPress={onGeminiOnly} accessibilityRole="button" style={styles.cancelButton}>
            <Text style={styles.cancelText}>{strings.geminiOnly}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17, 20, 38, 0.62)', justifyContent: 'center', paddingHorizontal: 20 },
  card: { width: '100%', maxWidth: 540, alignSelf: 'center', padding: 22, borderRadius: 24, backgroundColor: '#FFFFFF' },
  disclosure: { maxHeight: '68%' },
  providerBadge: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, backgroundColor: '#F0EEFF', marginBottom: 16 },
  providerBadgeText: { color: '#5144D0', fontSize: 12, fontWeight: '900' },
  title: { color: '#172033', fontSize: 22, lineHeight: 29, fontWeight: '900' },
  body: { color: '#343D52', fontSize: 15, lineHeight: 23, marginTop: 12 },
  agreeButton: { minHeight: 54, borderRadius: 16, backgroundColor: '#5144D0', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, marginTop: 22 },
  agreeText: { color: '#FFFFFF', fontSize: 15, lineHeight: 21, fontWeight: '800', textAlign: 'center' },
  cancelButton: { minHeight: 52, borderRadius: 16, backgroundColor: '#F1F2F6', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, marginTop: 9 },
  cancelText: { color: '#293248', fontSize: 15, fontWeight: '800' },
});
