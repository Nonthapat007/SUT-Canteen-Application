import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Polygon, G } from 'react-native-svg';

/**
 * Modern Linear & Filled Vector Icon System
 * Aesthetic: Clean geometric lines (2px stroke, round caps/joins) matching Lucide / SF Symbols
 * Supports variant='outline' (linear) and variant='filled'
 */
export default function Icon({
  name,
  size = 20,
  color = '#0F172A',
  variant = 'outline', // 'outline' | 'filled'
  strokeWidth = 2,
  style,
}) {
  const isFilled = variant === 'filled';

  const renderIconContent = () => {
    switch (name) {
      // --- NAVIGATION TABS ---
      case 'home':
        if (isFilled) {
          return (
            <Path
              d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
              fill={color}
            />
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <Polyline points="9 22 9 12 15 12 15 22" />
          </G>
        );

      case 'search':
        if (isFilled) {
          return (
            <G fill={color}>
              <Circle cx="11" cy="11" r="7" />
              <Rect x="15.5" y="14" width="3.2" height="7.5" rx="1.6" transform="rotate(-45 15.5 14)" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="11" cy="11" r="7" />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" />
          </G>
        );

      case 'orders':
      case 'receipt':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M4 2v18l3-2 3 2 3-2 3 2 4-2V2H4zm12 6H8V6h8v2zm0 4H8v-2h8v2zm-3 4H8v-2h5v2z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M4 2v19l3-2 3 2 3-2 3 2 4-2.5V2l-4 1.5L13 2l-3 1.5L7 2 4 2z" />
            <Line x1="8" y1="7" x2="16" y2="7" />
            <Line x1="8" y1="11" x2="16" y2="11" />
            <Line x1="8" y1="15" x2="13" y2="15" />
          </G>
        );

      case 'profile':
      case 'user':
        if (isFilled) {
          return (
            <G fill={color}>
              <Circle cx="12" cy="7" r="4.5" />
              <Path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
          </G>
        );

      // --- MERCHANT TABS ---
      case 'queue':
      case 'clipboard':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <Rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <Path d="M9 12l2 2 4-4" />
          </G>
        );

      case 'menu':
      case 'utensils':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5V22H21V2c-2.76 0-5 2.24-5 4z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M18 2v20" />
            <Path d="M21 2v4a3 3 0 0 1-3 3" />
            <Path d="M5 2v7a3 3 0 0 0 3 3v10" />
            <Path d="M9 2v4a2 2 0 0 1-2 2 2 2 0 0 1-2-2V2" />
          </G>
        );

      case 'summary':
      case 'chart':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13h2.8v6h-2.8z" />
              <Path d="M19 21H5a2 2 0 0 1-2-2V4a1 1 0 0 1 2 0v15h14a1 1 0 0 1 0 2z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="18" y1="20" x2="18" y2="10" />
            <Line x1="12" y1="20" x2="12" y2="4" />
            <Line x1="6" y1="20" x2="6" y2="14" />
          </G>
        );

      // --- LOCATION & PINS ---
      case 'location':
      case 'pin':
        if (isFilled) {
          return (
            <Path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
              fill={color}
            />
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
          </G>
        );

      // --- CLOCK & TIME ---
      case 'clock':
      case 'time':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 11h-4v-2h2.5V7h1.5v6z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="10" />
            <Polyline points="12 6 12 12 16 14" />
          </G>
        );

      // --- STAR ---
      case 'star':
        if (isFilled) {
          return (
            <Polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              fill={color}
            />
          );
        }
        return (
          <Polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      // --- HEART ---
      case 'heart':
        if (isFilled) {
          return (
            <Path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={color}
            />
          );
        }
        return (
          <Path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      // --- REORDER / REFRESH ---
      case 'refresh':
      case 'reorder':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Polyline points="23 4 23 10 17 10" />
            <Polyline points="1 20 1 14 7 14" />
            <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </G>
        );

      // --- BELL / NOTIFICATIONS ---
      case 'bell':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </G>
        );

      // --- SLIDERS / CUSTOMIZATIONS ---
      case 'sliders':
      case 'tune':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="4" y1="21" x2="4" y2="14" />
            <Line x1="4" y1="10" x2="4" y2="3" />
            <Line x1="12" y1="21" x2="12" y2="12" />
            <Line x1="12" y1="8" x2="12" y2="3" />
            <Line x1="20" y1="21" x2="20" y2="16" />
            <Line x1="20" y1="12" x2="20" y2="3" />
            <Line x1="1" y1="14" x2="7" y2="14" />
            <Line x1="9" y1="8" x2="15" y2="8" />
            <Line x1="17" y1="16" x2="23" y2="16" />
          </G>
        );

      // --- GLOBE / LANGUAGE ---
      case 'globe':
      case 'language':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="10" />
            <Line x1="2" y1="12" x2="22" y2="12" />
            <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </G>
        );

      // --- LOCK / PRIVACY ---
      case 'lock':
      case 'security':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </G>
        );

      // --- HELP / SUPPORT ---
      case 'help':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <Line x1="12" y1="17" x2="12.01" y2="17" />
          </G>
        );

      // --- CHEF / RESTAURANT ---
      case 'chef':
      case 'store':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M18.06 22.99h-12c-1.1 0-2-.9-2-2v-8h16v8c0 1.1-.9 2-2 2zM12 3a4.5 4.5 0 0 0-4.47 4.02A4 4 0 0 0 4 11h16a4 4 0 0 0-3.53-3.98A4.5 4.5 0 0 0 12 3z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M6 13.8V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9.8" />
            <Path d="M3 13.8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3c0-1.66-1.34-3-3-3H6a3 3 0 0 0-3 3z" />
            <Path d="M6 17v4a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-4" />
          </G>
        );

      // --- LOGOUT ---
      case 'logout':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <Polyline points="16 17 21 12 16 7" />
            <Line x1="21" y1="12" x2="9" y2="12" />
          </G>
        );

      // --- GEAR / SETTINGS ---
      case 'gear':
      case 'settings':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="3" />
            <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </G>
        );

      // --- ZAP / LIGHTNING ---
      case 'zap':
      case 'lightning':
        if (isFilled) {
          return (
            <Polygon
              points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
              fill={color}
            />
          );
        }
        return (
          <Polygon
            points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      // --- FLAME / FIRE ---
      case 'flame':
      case 'fire':
        if (isFilled) {
          return (
            <Path
              d="M12 23c-4.97 0-9-4.03-9-9 0-3.92 2.51-7.26 6.06-8.5.54-.19 1.13.14 1.25.7.13.58-.16 1.16-.7 1.39C7.11 8.65 5 11.08 5 14c0 3.86 3.14 7 7 7s7-3.14 7-7c0-2.09-1.12-4.03-2.92-5.11-.47-.28-.62-.89-.34-1.36.28-.48.89-.63 1.37-.34C19.46 8.67 21 11.21 21 14c0 4.97-4.03 9-9 9z"
              fill={color}
            />
          );
        }
        return (
          <Path
            d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-2.5-3.5-5.5-3.5-5.5s-3.5 3-3.5 5.5z M12 2c-3 5.5-8 7.5-8 13a8 8 0 0 0 16 0c0-5.5-5-7.5-8-13z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      // --- WALLET & CARDS ---
      case 'wallet':
        if (isFilled) {
          return (
            <G fill={color}>
              <Path d="M21 7.28V5c0-1.1-.9-2-2-2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </G>
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
            <Path d="M4 6v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H6" />
            <Circle cx="18" cy="14" r="1" fill={color} />
          </G>
        );

      // --- PACKAGE / BOX ---
      case 'package':
      case 'box':
        if (isFilled) {
          return (
            <Path
              d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"
              fill={color}
            />
          );
        }
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <Path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <Polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <Line x1="12" y1="22.08" x2="12" y2="12" />
          </G>
        );

      // --- USERS / CROWD ---
      case 'users':
      case 'crowd':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <Circle cx="9" cy="7" r="4" />
            <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </G>
        );

      // --- CHEVRONS & ARROWS ---
      case 'chevron-down':
        return (
          <Polyline
            points="6 9 12 15 18 9"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'chevron-up':
        return (
          <Polyline
            points="18 15 12 9 6 15"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'chevron-right':
        return (
          <Polyline
            points="9 18 15 12 9 6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'chevron-left':
        return (
          <Polyline
            points="15 18 9 12 15 6"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'arrow-right':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="5" y1="12" x2="19" y2="12" />
            <Polyline points="12 5 19 12 12 19" />
          </G>
        );

      case 'arrow-left':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="19" y1="12" x2="5" y2="12" />
            <Polyline points="12 19 5 12 12 5" />
          </G>
        );

      // --- PLUS, CHECK, CLOSE, MINUS ---
      case 'plus':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" />
            <Line x1="5" y1="12" x2="19" y2="12" />
          </G>
        );

      case 'minus':
      case 'remove':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="5" y1="12" x2="19" y2="12" />
          </G>
        );

      case 'check':
        return (
          <Polyline
            points="20 6 9 17 4 12"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );

      case 'close':
      case 'x':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Line x1="18" y1="6" x2="6" y2="18" />
            <Line x1="6" y1="6" x2="18" y2="18" />
          </G>
        );

      // --- QR CODE & PHONE ---
      case 'qr-code':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="3" y="3" width="7" height="7" />
            <Rect x="14" y="3" width="7" height="7" />
            <Rect x="3" y="14" width="7" height="7" />
            <Line x1="14" y1="14" x2="14" y2="14.01" />
            <Line x1="17" y1="17" x2="17" y2="21" />
            <Line x1="21" y1="14" x2="21" y2="18" />
          </G>
        );

      case 'phone':
        return (
          <Path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isFilled ? color : 'none'}
          />
        );

      // --- EYE / PASSWORD VISIBILITY ---
      case 'eye':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <Circle cx="12" cy="12" r="3" />
          </G>
        );

      case 'eye-off':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <Line x1="1" y1="1" x2="23" y2="23" />
          </G>
        );

      // --- MAIL / EMAIL ---
      case 'mail':
      case 'email':
      case 'envelope':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <Polyline points="22,6 12,13 2,6" />
          </G>
        );

      // --- ID CARD / BADGE ---
      case 'id-card':
      case 'badge':
      case 'card':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
            <Circle cx="9" cy="10" r="2" />
            <Line x1="14" y1="9" x2="17" y2="9" />
            <Line x1="14" y1="13" x2="17" y2="13" />
            <Line x1="7" y1="16" x2="17" y2="16" />
          </G>
        );

      // --- GRADUATION / STUDENT ---
      case 'graduation':
      case 'graduation-cap':
      case 'student':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <Path d="M6 12v5c3 3 9 3 12 0v-5" />
          </G>
        );

      // --- BRIEFCASE / TEACHER / STAFF ---
      case 'briefcase':
      case 'teacher':
      case 'staff':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <Path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </G>
        );

      // --- BUILDING / OFFICE / GENERAL ---
      case 'building':
      case 'office':
      case 'general':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <Line x1="9" y1="22" x2="9" y2="18" />
            <Line x1="9" y1="18" x2="15" y2="18" />
            <Line x1="15" y1="18" x2="15" y2="22" />
            <Line x1="8" y1="6" x2="8.01" y2="6" />
            <Line x1="12" y1="6" x2="12.01" y2="6" />
            <Line x1="16" y1="6" x2="16.01" y2="6" />
            <Line x1="8" y1="10" x2="8.01" y2="10" />
            <Line x1="12" y1="10" x2="12.01" y2="10" />
            <Line x1="16" y1="10" x2="16.01" y2="10" />
            <Line x1="8" y1="14" x2="8.01" y2="14" />
            <Line x1="12" y1="14" x2="12.01" y2="14" />
            <Line x1="16" y1="14" x2="16.01" y2="14" />
          </G>
        );

      // --- EDIT / PENCIL ---
      case 'edit':
      case 'pencil':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </G>
        );

      // --- CHAT / MESSAGE ---
      case 'chat':
      case 'message':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </G>
        );

      // --- SMARTPHONE / MOBILE ---
      case 'smartphone':
      case 'mobile':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <Line x1="12" y1="18" x2="12.01" y2="18" />
          </G>
        );

      // --- BURGER / FAST FOOD ---
      case 'burger':
      case 'fast-food':
      case 'food':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M3 11h18a9 9 0 0 0-18 0z" />
            <Path d="M4 17h16a2 2 0 0 1 0 4H4a2 2 0 0 1 0-4z" />
            <Line x1="3" y1="14" x2="21" y2="14" />
          </G>
        );

      // --- LIFE-BUOY / SUPPORT ---
      case 'life-buoy':
      case 'support':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="10" />
            <Circle cx="12" cy="12" r="4" />
            <Line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
            <Line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
            <Line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
            <Line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
          </G>
        );

      // --- PENCIL / EDIT ---
      case 'pencil':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
          </G>
        );

      case 'edit':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </G>
        );

      // --- CAMERA / PHOTO ---
      case 'camera':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <Circle cx="12" cy="13" r="4" />
          </G>
        );

      case 'image':
      case 'photo':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <Circle cx="8.5" cy="8.5" r="1.5" />
            <Polyline points="21 15 16 10 5 21" />
          </G>
        );

      // --- PHONE ---
      case 'phone':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </G>
        );

      // --- MAIL / EMAIL ---
      case 'mail':
      case 'email':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <Polyline points="22,6 12,13 2,6" />
          </G>
        );

      // --- ALERT-CIRCLE ---
      case 'alert-circle':
        return (
          <G stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <Circle cx="12" cy="12" r="10" />
            <Line x1="12" y1="8" x2="12" y2="12" />
            <Line x1="12" y1="16" x2="12.01" y2="16" />
          </G>
        );

      // Fallback: simple dot
      default:
        return <Circle cx="12" cy="12" r="4" fill={color} />;
    }
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
    >
      {renderIconContent()}
    </Svg>
  );
}
