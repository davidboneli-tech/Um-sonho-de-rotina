import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';

function pressedColor(color: unknown): string {
  if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) return '#00000012';
  return '#' + [1, 3, 5].map(i => Math.round(parseInt(color.slice(i, i + 2), 16) * 0.88).toString(16).padStart(2, '0')).join('');
}

// Immediate feedback while held; layout and hit area remain unchanged.
export function Touch({ style, disabled, accessibilityState, ...props }: PressableProps) {
  return <Pressable {...props} disabled={disabled} accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
    style={state => {
      const base = typeof style === 'function' ? style(state) : style;
      if (!state.pressed || disabled) return base;
      const flat = StyleSheet.flatten(base);
      return [base, { backgroundColor: pressedColor(flat?.backgroundColor), transform: [{ translateY: 1 }, { scale: 0.98 }] }];
    }} />;
}
