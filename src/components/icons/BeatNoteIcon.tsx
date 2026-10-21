import React from 'react';
import Svg, { Circle, Path, Rect, SvgProps } from 'react-native-svg';
import { colors } from '../../styles/common';

export type BeatNoteIconName =
  | 'audio-file' | 'projects' | 'save' | 'import' | 'export' | 'settings' | 'help'
  | 'play' | 'pause' | 'first' | 'previous' | 'next' | 'repeat' | 'shuffle' | 'range-loop'
  | 'marker' | 'marker-add' | 'marker-remove' | 'marker-previous' | 'marker-next'
  | 'marker-remove-previous' | 'marker-loop' | 'annotation' | 'clear' | 'restore'
  | 'chevron-left' | 'chevron-up' | 'chevron-down' | 'warning' | 'music-library'
  | 'more' | 'current' | 'missing-audio' | 'close' | 'search' | 'sort'
  | 'unified' | 'multitrack' | 'stems-2' | 'stems-4' | 'stems-6'
  | 'vocals' | 'drums' | 'bass' | 'piano' | 'guitar' | 'other';

interface BeatNoteIconProps {
  name: BeatNoteIconName;
  size?: number;
  color?: string;
  testID?: string;
  style?: SvgProps['style'];
}

const strokeProps = {
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 1.75,
};

/** BeatNote's rounded, optically balanced icon family. */
const BeatNoteIcon: React.FC<BeatNoteIconProps> = ({
  name,
  size = 20,
  color = '#ffffff',
  testID,
  style,
}) => {
  const common = { ...strokeProps, stroke: color };
  const wideMarkerComposite = name === 'marker-previous' || name === 'marker-next' || name === 'marker-remove-previous';
  const loopFrame = <>
    <Path d="M3.5 9V7.5A3.5 3.5 0 0 1 7 4h12m-3-3 3 3-3 3" {...common} />
    <Path d="M20.5 15v1.5A3.5 3.5 0 0 1 17 20H5m3 3-3-3 3-3" {...common} />
  </>;

  const glyph = (() => {
    switch (name) {
      case 'audio-file':
        return <Path d="M14 5v10.5a2.5 2.5 0 1 1-2-2.45H14V5c3 .25 5 1.6 5 4" {...common} />;
      case 'projects':
        return <><Rect x="4" y="5" width="16" height="14" rx="2" {...common} /><Path d="M8 8v8M12 8v8M16 8v8" {...common} /></>;
      case 'save':
        return <><Rect x="4" y="4" width="16" height="16" rx="3" {...common} /><Path d="M8 4v6h8V4M8 20v-6h8v6" {...common} /></>;
      case 'import':
      case 'export': {
        const arrow = name === 'import' ? 'M21 13h-9m3-3-3 3 3 3' : 'M12 13h9m-3-3 3 3-3 3';
        return <><Path d="M4 4h7l4 4v12H4Z M11 4v4h4" {...common} /><Path d={arrow} {...common} /></>;
      }
      case 'settings':
        return <><Path d="m9.7 4.1.7-2.1h3.2l.7 2.1 1.7.7 2-1L20.2 6l-1 2 .7 1.7 2.1.7v3.2l-2.1.7-.7 1.7 1 2-2.2 2.2-2-1-1.7.7-.7 2.1h-3.2l-.7-2.1-1.7-.7-2 1L3.8 18l1-2-.7-1.7-2.1-.7v-3.2l2.1-.7L4.8 8l-1-2L6 3.8l2 1Z" {...common} /><Circle cx="12" cy="12" r="3" {...common} /></>;
      case 'help':
        return <><Circle cx="12" cy="12" r="8.5" {...common} /><Path d="M9.8 9.5a2.4 2.4 0 1 1 3.5 2.2c-.8.5-1.3 1-1.3 2M12 17h.01" {...common} /></>;
      case 'play':
        return <Path d="M9.4 5.4c-.65-.4-1.4.08-1.4.85v11.5c0 .77.75 1.25 1.4.85l9.2-5.75c.6-.38.6-1.32 0-1.7Z" fill={color} />;
      case 'pause':
        return <><Rect x="7" y="5" width="3.5" height="14" rx="1" fill={color} /><Rect x="13.5" y="5" width="3.5" height="14" rx="1" fill={color} /></>;
      case 'first':
        return <><Rect x="5" y="5" width="2.5" height="14" rx="1.25" fill={color} /><Path d="M17.1 5.55c.65-.42 1.4.05 1.4.82v11.26c0 .77-.75 1.24-1.4.82L8.4 12.8a.95.95 0 0 1 0-1.6Z" fill={color} /></>;
      case 'previous':
      case 'next': {
        const paths = name === 'previous'
          ? [
            'M11.1 5.25c.6-.45 1.4-.02 1.4.73v12.04c0 .75-.8 1.18-1.4.73L4.3 12.7a.93.93 0 0 1 0-1.4Z',
            'M20.1 5.25c.6-.45 1.4-.02 1.4.73v12.04c0 .75-.8 1.18-1.4.73l-6.8-6.05a.93.93 0 0 1 0-1.4Z',
          ]
          : [
            'M3.9 5.25c-.6-.45-1.4-.02-1.4.73v12.04c0 .75.8 1.18 1.4.73l6.8-6.05a.93.93 0 0 0 0-1.4Z',
            'M12.9 5.25c-.6-.45-1.4-.02-1.4.73v12.04c0 .75.8 1.18 1.4.73l6.8-6.05a.93.93 0 0 0 0-1.4Z',
          ];
        return <>{paths.map(path => <Path key={path} d={path} fill={color} />)}</>;
      }
      case 'repeat':
        return loopFrame;
      case 'shuffle':
        return <><Path d="M4 7h3c4 0 6 10 10 10h3M17 14l3 3-3 3" {...common} /><Path d="M4 17h3c1.5 0 2.7-1.4 3.8-3M14 9c1-1.2 2-2 3-2h3M17 4l3 3-3 3" {...common} /></>;
      case 'range-loop':
        return <>{loopFrame}<Circle cx="9" cy="12" r="1.25" fill={color} /><Path d="M10.5 12h3" {...common} /><Circle cx="15" cy="12" r="1.25" fill={color} /></>;
      case 'marker':
      case 'marker-add':
      case 'marker-remove': {
        const operationColor = color === colors.textSecondary
          ? color
          : name === 'marker-add'
            ? colors.iconPositive
            : name === 'marker-remove'
              ? colors.iconDestructive
              : undefined;
        return <Path d="M7 4h10v10l-5 5-5-5Z" {...strokeProps} fill={operationColor ?? color} stroke={operationColor ?? color} />;
      }
      case 'marker-previous':
        return <><Path d="M4 4h10v10l-5 5-5-5Z" fill={color} /><Path d="M29 12H18m4-4-4 4 4 4" {...common} /></>;
      case 'marker-next':
        return <><Path d="M18 4h10v10l-5 5-5-5Z" fill={color} /><Path d="M3 12h11m-4-4 4 4-4 4" {...common} /></>;
      case 'marker-remove-previous':
        return <><Path d="M4 4h10v10l-5 5-5-5Z" fill={color === colors.textSecondary ? color : colors.iconDestructive} /><Path d="M29 12H18m4-4-4 4 4 4" {...common} /></>;
      case 'marker-loop':
        return <>{loopFrame}<Path d="M9 8h6v5.5l-3 3-3-3Z" fill={color} /></>;
      case 'annotation':
        return <><Path d="M5 5h14v11H9l-4 4Z" {...common} /><Path d="M8 9h8M8 12.5h5" {...common} /></>;
      case 'clear':
        return <><Path d="M7 7h10l-1 13H8ZM5 7h14" {...common} /><Path d="M9 7l1-3h4l1 3" {...common} /></>;
      case 'restore':
        return <><Path d="M5 8V4m0 0h4M5 4l3 3" {...common} /><Path d="M5.7 7A8 8 0 1 1 4 15" {...common} /></>;
      case 'chevron-left':
        return <Path d="m14.5 6-6 6 6 6" {...common} />;
      case 'chevron-up':
        return <Path d="m6 15.5 6-6 6 6" {...common} />;
      case 'chevron-down':
        return <Path d="m6 8.5 6 6 6-6" {...common} />;
      case 'warning':
        return <><Path d="M12 3.5 21 20H3Z" {...common} /><Path d="M12 9v5M12 17.2h.01" {...common} /></>;
      case 'music-library':
        return <><Rect x="4" y="4" width="16" height="16" rx="2.5" {...common} /><Path d="M9 16.5V8.5l7-1.5v7.5M9 16.5a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm7-2a2 2 0 1 1-2-2 2 2 0 0 1 2 2Z" {...common} /></>;
      case 'more':
        return <><Circle cx="6" cy="12" r="1.5" fill={color} /><Circle cx="12" cy="12" r="1.5" fill={color} /><Circle cx="18" cy="12" r="1.5" fill={color} /></>;
      case 'current':
        return <><Circle cx="12" cy="12" r="8" {...common} /><Path d="m8.5 12 2.25 2.25 4.75-5" {...common} /></>;
      case 'missing-audio':
        return <><Path d="M8 16V7.5L15 6v7" {...common} /><Circle cx="6" cy="16" r="2" fill={color} /><Circle cx="13" cy="13" r="2" fill={color} /><Path d="m16 15 4 4m0-4-4 4" {...common} /></>;
      case 'close':
        return <Path d="m6 6 12 12M18 6 6 18" {...common} />;
      case 'search':
        return <><Circle cx="10.5" cy="10.5" r="6.5" {...common} /><Path d="m15.5 15.5 4.5 4.5" {...common} /></>;
      case 'sort':
        return <><Path d="M8 5v14m-3-3 3 3 3-3" {...common} /><Path d="M14 7h6M14 12h4.5M14 17h3" {...common} /></>;
      case 'unified':
        return <><Path d="m4 9 8-4 8 4-8 4Z" {...common} /><Path d="m5 13 7 3.5 7-3.5M5 17l7 3.5 7-3.5" {...common} /></>;
      case 'multitrack':
        return <><Path d="M5 19V9M12 19V5M19 19v-7" {...common} /><Path d="M3 19h4M10 19h4M17 19h4" {...common} /></>;
      case 'stems-2':
        return <Path d="M5 8h14M5 16h14" {...common} />;
      case 'stems-4':
        return <><Rect x="4" y="4" width="6" height="6" rx="1" {...common} /><Rect x="14" y="4" width="6" height="6" rx="1" {...common} /><Rect x="4" y="14" width="6" height="6" rx="1" {...common} /><Rect x="14" y="14" width="6" height="6" rx="1" {...common} /></>;
      case 'stems-6':
        return <Path d="M4 6h16M4 12h16M4 18h16" {...common} />;
      case 'vocals':
        return <><Rect x="8" y="3" width="8" height="12" rx="4" {...common} /><Path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" {...common} /></>;
      case 'drums':
        return <Path d="M5 8v9c0 2 3.1 3 7 3s7-1 7-3V8M5 8c0-2 3.1-3 7-3s7 1 7 3-3.1 3-7 3-7-1-7-3Z" {...common} />;
      case 'bass':
        return <Path d="M4 12h3l2-5 4 10 2-5h5" {...common} />;
      case 'piano':
        return <><Rect x="4" y="6" width="16" height="12" rx="2" {...common} /><Path d="M9 6v7m6-7v7M7 13h10" {...common} /></>;
      case 'guitar':
        return <><Path d="M12 4c5 0 7 3 7 7 0 5-4 9-7 10-3-1-7-5-7-10 0-4 2-7 7-7Z" {...common} /><Path d="M12 8v9" {...common} /></>;
      case 'other':
        return <><Path d="M9 18V7l10-2v10" {...common} /><Path d="M9 18a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm10-3a2 2 0 1 1-2-2 2 2 0 0 1 2 2Z" {...common} /></>;
    }
  })();

  return (
    <Svg
      testID={testID}
      width={wideMarkerComposite ? size * 4 / 3 : size}
      height={size}
      viewBox={wideMarkerComposite ? '0 0 32 24' : '0 0 24 24'}
      fill="none"
      style={style}
    >
      {glyph}
    </Svg>
  );
};

export default React.memo(BeatNoteIcon);
