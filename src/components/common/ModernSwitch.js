import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  View,
} from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * ModernSwitch
 * Cross-platform iOS-style smooth pill toggle switch.
 * Replaces React Native Web's default <Switch> which renders as an unstyled Material checkbox.
 */
export default function ModernSwitch({
  value = false,
  onValueChange,
  disabled = false,
  activeTrackColor = COLORS.primary,
  inactiveTrackColor = '#CBD5E1',
  thumbColor = '#FFFFFF',
  size = 'medium',
  style,
}) {
  const isSmall = size === 'small';
  const trackWidth = isSmall ? 40 : 48;
  const trackHeight = isSmall ? 22 : 26;
  const thumbSize = isSmall ? 18 : 22;
  const maxTranslate = trackWidth - thumbSize - 4; // 2px margin each side

  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (disabled) return;
    if (onValueChange) {
      onValueChange(!value);
    }
  };

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveTrackColor, activeTrackColor],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, maxTranslate + 2],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, style]}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            borderRadius: trackHeight / 2,
            backgroundColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    justifyContent: 'center',
  },
  thumb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 2.5,
    elevation: 3,
  },
});
