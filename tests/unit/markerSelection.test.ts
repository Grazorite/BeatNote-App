import type { Layer } from '../../src/hooks/useStudioStore';
import {
  ANNOTATION_DWELL_MS,
  findMarkerNearTime,
  findTimedAnnotationMarker,
  getMarkerAnnotation,
} from '../../src/utils/markerSelection';

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

  it('keeps an annotation readable after its marker and then expires it', () => {
    expect(findTimedAnnotationMarker(layers, 900, 'vocals')).toEqual({ layerId: 'vocals', timestamp: 900 });
    expect(findTimedAnnotationMarker(layers, 900 + ANNOTATION_DWELL_MS, 'vocals')).toEqual({
      layerId: 'vocals',
      timestamp: 900,
    });
    expect(findTimedAnnotationMarker(layers, 901 + ANNOTATION_DWELL_MS, 'vocals')).toBeNull();
  });

  it('switches immediately to the newest successive annotation and prefers the active layer on ties', () => {
    const successive: Layer[] = [
      { ...layers[0], markers: [900, 1500], annotations: [
        { timestamp: 900, text: 'First' },
        { timestamp: 1500, text: 'Second' },
      ] },
      { ...layers[1], markers: [1500], annotations: [{ timestamp: 1500, text: 'Drum hit' }] },
    ];

    expect(findTimedAnnotationMarker(successive, 1499, 'drums')).toEqual({ layerId: 'vocals', timestamp: 900 });
    expect(findTimedAnnotationMarker(successive, 1500, 'drums')).toEqual({ layerId: 'drums', timestamp: 1500 });
  });

  it('does not let an unannotated marker displace a visible note', () => {
    expect(findTimedAnnotationMarker(layers, 1100, 'vocals')).toEqual({ layerId: 'vocals', timestamp: 900 });
  });
});
