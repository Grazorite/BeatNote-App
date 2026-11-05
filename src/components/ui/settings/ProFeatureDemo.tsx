import React, { useEffect, useState } from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors } from '../../../styles/common';

const MovingRect = Animated.createAnimatedComponent(Rect);
const MovingCircle = Animated.createAnimatedComponent(Circle);
const STEP_MS = 2000;
const WAVE = Array.from({ length: 45 }, (_, index) => 8 + Math.abs(Math.sin(index * 1.7) * Math.cos(index * 0.31)) * 42);

interface ProFeatureDemoProps {
  kind: 'playback' | 'speed' | 'tempo' | 'remote';
  active: boolean;
  reduceMotion: boolean;
}

const Waveform: React.FC = () => <G>{WAVE.map((height, index) => (
  <Rect key={index} x={27 + index * 6} y={77 - height / 2} width={3} height={height} rx={1.5} fill={colors.textSecondary} />
))}</G>;

const Label: React.FC<{ x?: number; y: number; accent?: boolean; children: React.ReactNode }> = ({ x = 160, y, accent = false, children }) => (
  <SvgText x={x} y={y} textAnchor="middle" fill={accent ? colors.accent : colors.textSecondary} fontSize={11} fontWeight="600">{children}</SvgText>
);

/** Illustrative, silent workflows. Only the visible demo runs; no app playback or storage is touched. */
const ProFeatureDemo: React.FC<ProFeatureDemoProps> = ({ kind, active, reduceMotion }) => {
  const [step, setStep] = useState(0);
  const progress = useSharedValue(0);
  const phase = reduceMotion ? (kind === 'tempo' ? 2 : 1) : step;
  const queueIndex = phase % 3;
  const speedIndex = [2, 0, 1][phase % 3];
  const speed = [0.75, 0.9, 1][speedIndex];
  const paused = kind === 'remote' && (phase % 4 === 1 || phase % 4 === 2);

  useEffect(() => {
    setStep(0);
    if (!active || reduceMotion) return;
    const timer = setInterval(() => setStep(value => (value + 1) % 12), STEP_MS);
    return () => clearInterval(timer);
  }, [active, reduceMotion]);

  useEffect(() => {
    cancelAnimation(progress);
    if (!active || reduceMotion) { progress.value = 0.55; return; }
    progress.value = 0;
    if (!paused) progress.value = withTiming(1, {
      duration: kind === 'speed' ? STEP_MS / speed : STEP_MS,
      easing: Easing.linear,
    });
    return () => cancelAnimation(progress);
  }, [active, kind, paused, phase, progress, reduceMotion, speed]);

  const queueProgress = useAnimatedProps(() => ({ width: 218 * progress.value }));
  const cursor = useAnimatedProps(() => ({ x: 27 + 266 * progress.value }));
  const remotePosition = useAnimatedProps(() => ({ cx: [60, 80, 160, 160][phase % 4] + (paused ? 0 : 20 * progress.value) }));

  return (
    <Svg width="100%" height="100%" viewBox="0 0 320 176" testID={`pro-demo-${kind}`}>
      <G fontFamily="Arial">
      {kind === 'playback' && <>
        <Label y={15} accent>CONTINUOUS PLAY · ON</Label>
        {['Warm-up', 'Across the floor', 'Final run'].map((title, index) => <G key={title}>
          <Rect x={20} y={26 + index * 39} width={280} height={34} rx={8} fill={colors.surfaceRaised}
            stroke={index === queueIndex ? colors.accent : colors.borderSubtle} />
          <SvgText x={35} y={48 + index * 39} fontSize={13} fill={index === queueIndex ? colors.accent : colors.textSecondary}>{index === queueIndex ? '▶' : String(index + 1).padStart(2, '0')}</SvgText>
          <SvgText x={64} y={47 + index * 39} fontSize={12} fill={colors.text}>{title}</SvgText>
          <SvgText x={286} y={47 + index * 39} textAnchor="end" fontSize={8} fill={index === queueIndex ? colors.accent : colors.textSecondary}>{index === queueIndex ? 'PLAYING' : index < queueIndex ? 'PLAYED' : 'UP NEXT'}</SvgText>
        </G>)}
        <MovingRect x={64} y={54 + queueIndex * 39} height={2} rx={1} fill={colors.accent} animatedProps={queueProgress} />
        <Label y={166}>The next song starts automatically</Label>
      </>}
      {kind === 'speed' && <>
        <SvgText x={160} y={27} textAnchor="middle" fontSize={24} fontWeight="700" fill={colors.text}>{`${speed.toFixed(2)}×`}</SvgText>
        <Waveform />
        <MovingRect y={46} width={2} height={63} rx={1} fill={colors.accent} animatedProps={cursor} />
        {['0.75×', '0.90×', '1.00×'].map((label, index) => <G key={label}>
          <Rect x={29 + index * 91} y={119} width={80} height={27} rx={7} fill={colors.surfaceRaised} stroke={index === speedIndex ? colors.accent : colors.borderSubtle} />
          <SvgText x={69 + index * 91} y={137} textAnchor="middle" fontSize={12} fontWeight="600" fill={index === speedIndex ? colors.accent : colors.text}>{label}</SvgText>
        </G>)}
        <Label y={166}>The playhead follows the selected speed</Label>
      </>}
      {kind === 'tempo' && <>
        <Label y={20} accent>{phase % 3 === 0 ? 'ANALYSING YOUR MUSIC…' : phase % 3 === 1 ? 'SUGGESTED TEMPO · 128 BPM' : '128 BPM · GRID APPLIED'}</Label>
        <Waveform />
        {phase % 3 === 0 ? <MovingRect y={43} width={3} height={66} fill={colors.accent} animatedProps={cursor} />
          : Array.from({ length: 8 }, (_, index) => <G key={index}>
            <Line x1={35 + index * 36} x2={35 + index * 36} y1={39} y2={110} stroke={phase % 3 === 1 ? colors.accent : index === 0 ? colors.gridMajor : colors.gridMiddle}
              strokeWidth={index === 0 ? 2 : 1.25} strokeLinecap="round" strokeDasharray={index === 0 ? '1 3' : '1 4'} />
            <SvgText x={35 + index * 36} y={126} textAnchor="middle" fontSize={10} fill={colors.text}>{index + 1}</SvgText>
          </G>)}
        <Rect x={101} y={138} width={118} height={25} rx={8} fill={phase % 3 === 2 ? colors.accent : colors.surfaceRaised} />
        <SvgText x={160} y={155} textAnchor="middle" fontSize={11} fill={phase % 3 === 2 ? colors.onAccent : colors.text}>{phase % 3 === 0 ? 'Listening for the beat' : phase % 3 === 1 ? 'Preview the grid' : '✓ Beat grid aligned'}</SvgText>
      </>}
      {kind === 'remote' && <>
        <Rect x={34} y={9} width={252} height={157} rx={20} fill={colors.surfaceRaised} stroke={colors.borderEmphasis} />
        <Path d="M154 25v-5a6 6 0 0 1 12 0v5" fill="none" stroke={colors.textSecondary} strokeWidth={2} />
        <Rect x={151} y={24} width={18} height={13} rx={3} fill={colors.textSecondary} />
        <SvgText x={160} y={57} textAnchor="middle" fontSize={14} fontWeight="600" fill={colors.text}>Rehearsal mix</SvgText>
        <Line x1={60} x2={260} y1={78} y2={78} stroke={colors.border} strokeWidth={3} />
        <MovingCircle cy={78} r={4} fill={colors.accent} animatedProps={remotePosition} />
        <Circle cx={phase % 4 === 2 ? 231 : 160} cy={109} r={20} fill={phase % 4 === 1 || phase % 4 === 2 ? colors.controlActive : colors.surface} />
        <Label x={89} y={114}>−10s</Label><Label x={231} y={114}>+10s</Label>
        {paused ? <Path d="M155 100l14 9-14 9z" fill={colors.text} /> : <G><Rect x={153} y={101} width={5} height={16} rx={1} fill={colors.text} /><Rect x={163} y={101} width={5} height={16} rx={1} fill={colors.text} /></G>}
        <Label y={151} accent>{['Playing from the Lock Screen', 'Playback paused', 'Skipped ahead 10 seconds', 'Playback resumed'][phase % 4]}</Label>
      </>}
      </G>
    </Svg>
  );
};

export default ProFeatureDemo;
