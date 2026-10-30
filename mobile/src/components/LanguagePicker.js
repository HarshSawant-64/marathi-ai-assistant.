import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Text from './AccessibleText';
import { LANGUAGES } from '../config/languages';

export default function LanguagePicker({ language, onChange, compact = false }) {
  return (
    <View style={styles.list}>
      {LANGUAGES.map((item) => {
        const selected = language === item.code;
        return (
          <Pressable
            key={item.code}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(item.code)}
            style={[styles.option, compact && styles.compactOption, selected && styles.selected]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={styles.copy}>
              <Text style={styles.nativeName} allowFontScaling>{item.nativeName}</Text>
              {!compact ? <Text style={styles.englishName} allowFontScaling>{item.englishName}</Text> : null}
            </View>
            {selected ? <Text style={styles.check} accessibilityLabel="Selected">✓</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  option: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  compactOption: { minHeight: 58, borderRadius: 15, paddingVertical: 8 },
  selected: { borderColor: '#5B4DE6', backgroundColor: '#F5F3FF' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#98A0B3', alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: '#5B4DE6' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#5B4DE6' },
  copy: { flex: 1 },
  nativeName: { color: '#172033', fontSize: 19, fontWeight: '700' },
  englishName: { color: '#687086', fontSize: 13, marginTop: 2 },
  check: { color: '#4D3FD2', fontWeight: '800', fontSize: 18 },
});
