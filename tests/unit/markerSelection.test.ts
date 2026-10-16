import type { Layer } from '../../src/hooks/useStudioStore';
import { findMarkerNearTime, getMarkerAnnotation } from '../../src/utils/markerSelection';

const layers: Layer[] = [
  {
    id: 'vocals',
    name: 'Vocals',
    color: '#fff',
    markers: [900, 1100],
    annotations: [{ timestamp: 900, text: 'Turn' }],
    isVisible: true,
  },
  {
    id: 'drums',
    name: 'Drums',
    color: '#fff',
    markers: [900],
    annotations: [],
    isVisible: true,
  },
];

describe('marker selection at the playhead', () => {
  it('includes the 100 ms boundary and prefers the active layer on a tie', () => {
    expect(findMarkerNearTime(layers, 1000, 'drums')).toEqual({ layerId: 'drums', timestamp: 900 });
  });

  it('returns no marker outside the tolerance and reads the selected annotation', () => {
    expect(findMarkerNearTime(layers, 1001, 'vocals')).toEqual({ layerId: 'vocals', timestamp: 1100 });
    expect(findMarkerNearTime(layers, 1201, 'vocals')).toBeNull();
    expect(getMarkerAnnotation(layers, { layerId: 'vocals', timestamp: 900 })).toBe('Turn');
  });
});
