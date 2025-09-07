import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  style?: ViewStyle;
};

// A compact shopping-list illustration that can also work as an avatar badge.
export default function OnboardingIllustration({ size = 120, style }: Props) {
  const w = size;
  return (
    <Svg width={w} height={w} viewBox="0 0 120 120" style={style}>
      {/* soft, neutral background for avatars */}
      <Circle cx="60" cy="60" r="58" fill="#f6fffb" />

      {/* list card */}
      <Rect x="14" y="20" rx="14" width="92" height="80" fill="#ffffff" stroke="#f0f0f0" strokeWidth={1} />

      {/* anthropomorphic face on the card (acts as avatar) */}
      <Circle cx="36" cy="40" r="10" fill="#8bf18b" />
      {/* eyes */}
      <Circle cx="32" cy="38" r="1.8" fill="#074e3f" />
      <Circle cx="40" cy="38" r="1.8" fill="#074e3f" />
      {/* smile */}
      <Path d="M30 44c3 3 7 3 10 0" stroke="#05463a" strokeWidth={1.6} strokeLinecap="round" fill="none" />

      {/* list items with clear shopping icons */}
      {/* first item - checked, 'Apple' icon */}
      <Rect x="54" y="34" width="10" height="10" rx="2" fill="#8bdcf1" />
      <Path d="M56 38a3 3 0 1 0 6 0 3 3 0 0 0-6 0z" fill="#fff" transform="translate(0,0)" />
      <Line x1="68" y1="39" x2="94" y2="39" stroke="#9aa0a6" strokeWidth={2} strokeLinecap="round" />

      {/* second item - unchecked, 'Milk' box icon */}
      <Rect x="54" y="50" width="10" height="10" rx="2" fill="#ffffff" stroke="#e6e6e6" />
      <Rect x="56" y="52" width="6" height="6" fill="#ffd166" rx="1" />
      <Line x1="68" y1="55" x2="94" y2="55" stroke="#9aa0a6" strokeWidth={2} strokeLinecap="round" />

      {/* third item - partial, 'Carrot' icon */}
      <Rect x="54" y="66" width="10" height="10" rx="2" fill="#ffffff" stroke="#e6e6e6" />
      <Path d="M58 70 l4 -2 l2 6 l-6 0 z" fill="#ff7a5c" />
      <Line x1="68" y1="69" x2="88" y2="69" stroke="#9aa0a6" strokeWidth={2} strokeLinecap="round" />

      {/* small pencil accent */}
      <Path d="M86 84 L94 76 L102 84 L94 92 Z" fill="#ffd166" opacity={0.95} />
      <Path d="M84 86 L92 78" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}
