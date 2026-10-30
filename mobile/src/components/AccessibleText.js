import React, { useContext } from 'react';
import { StyleSheet, Text as NativeText } from 'react-native';

import { AccessibilityContext } from './AccessibilityContext';

const LIGHT_TEXT_ON_DARK_SURFACES = new Set([
  '#FFFFFF', '#FFF', '#DCD9FF', '#D0CEE4', '#E4E2F2', '#AEACC8', '#C4C1DB', '#D8D5FF',
]);

export default function AccessibleText({ style, ...props }) {
  const { textScale = 1, highContrast = false } = useContext(AccessibilityContext);
  const flattened = StyleSheet.flatten(style) || {};
  const scaledFontSize = typeof flattened.fontSize === 'number'
    ? Math.max(flattened.fontSize * textScale, textScale > 1 ? 13 : 0)
    : undefined;
  const scaledLineHeight = typeof flattened.lineHeight === 'number'
    ? flattened.lineHeight * textScale
    : undefined;
  const originalColor = typeof flattened.color === 'string' ? flattened.color.toUpperCase() : '';

  return (
    <NativeText
      {...props}
      allowFontScaling
      maxFontSizeMultiplier={1.8}
      style={[
        style,
        scaledFontSize !== undefined && { fontSize: scaledFontSize },
        scaledLineHeight !== undefined && { lineHeight: scaledLineHeight },
        highContrast && flattened.color && {
          color: LIGHT_TEXT_ON_DARK_SURFACES.has(originalColor) ? '#FFFFFF' : '#111318',
        },
      ]}
    />
  );
}
