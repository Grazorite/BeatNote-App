import {
  clusterAnnotationIndicators,
  AnnotationIndicator,
} from '../../src/utils/annotationClusters';

const make = (layerId: AnnotationIndicator['layerId'], timestamp: number, x: number): AnnotationIndicator => ({
  layerId,
  color: '#000000',
  timestamp,
  x,
});

describe('clusterAnnotationIndicators', () => {
  it('returns [] for empty input', () => {
    expect(clusterAnnotationIndicators([])).toEqual([]);
  });

  it('returns a single-member cluster for a single valid indicator', () => {
    const [cluster] = clusterAnnotationIndicators([make('drums', 2000, 100)]);
    expect(cluster.members).toEqual([make('drums', 2000, 100)]);
    expect(cluster.x).toBe(100);
  });

  it('sorts deterministically by x, then timestamp, then layerId without mutating input', () => {
    const input: AnnotationIndicator[] = [
      make('bass', 3000, 50),
      make('bass', 2000, 70),
      make('drums', 1000, 70),
      make('drums', 1000, 50),
      make('other', 9000, 50),
    ];
    const snapshot = structuredClone(input);
    const clusters = clusterAnnotationIndicators(input, 0);
    expect(input).toEqual(snapshot);
    expect(clusters.map((c) => [c.x, c.members.map((m) => m.layerId)]))
      .toEqual([[50, ['drums', 'bass', 'other']], [70, ['drums', 'bass']]]);
  });

  it('groups indicators within threshold across layers at a mean x', () => {
    const clusters = clusterAnnotationIndicators(
      [make('drums', 1000, 100), make('bass', 2000, 106), make('vocals', 3000, 102)],
      8,
    );
    expect(clusters).toHaveLength(1);
    expect(clusters[0].members).toHaveLength(3);
    expect(clusters[0].x).toBeCloseTo((100 + 106 + 102) / 3);
  });

  it('includes indicators exactly at the threshold boundary', () => {
    const clusters = clusterAnnotationIndicators([make('drums', 1000, 0), make('bass', 2000, 8)], 8);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].members).toHaveLength(2);
  });

  it('starts a new cluster just past the threshold', () => {
    const clusters = clusterAnnotationIndicators([make('drums', 1000, 0), make('bass', 2000, 8.1)], 8);
    expect(clusters).toHaveLength(2);
    expect(clusters[1].members).toHaveLength(1);
  });

  it('prevents transitive chains from growing beyond the first member', () => {
    const clusters = clusterAnnotationIndicators(
      [make('drums', 1000, 0), make('drums', 2000, 7), make('drums', 3000, 12)],
      8,
    );
    // 7 is within 8 of 0, but 12 is beyond 8 of the first member (0), so it clusters alone.
    expect(clusters).toHaveLength(2);
    expect(clusters[0].members).toHaveLength(2);
    expect(clusters[1].members).toHaveLength(1);
  });

  it('ignores indicators with non-finite x or timestamp', () => {
    const clusters = clusterAnnotationIndicators(
      [
        make('drums', 1000, NaN),
        make('bass', Infinity, 50),
        make('vocals', 2000, 50),
        { ...make('piano', 500, 10), x: Number.POSITIVE_INFINITY },
      ],
      8,
    );
    expect(clusters).toHaveLength(1);
    expect(clusters[0].members).toEqual([make('vocals', 2000, 50)]);
  });

  it('treats negative thresholds as 0 and groups only identical x values', () => {
    const clusters = clusterAnnotationIndicators(
      [make('drums', 1000, 10), make('bass', 2000, 10.0001)],
      -4,
    );
    expect(clusters).toHaveLength(2);
  });

  it('treats non-finite thresholds as 0', () => {
    const clusters = clusterAnnotationIndicators([make('drums', 1000, 10), make('bass', 2000, 11)], NaN);
    expect(clusters).toHaveLength(2);
  });

  it('normalizes threshold 0 so identical x positions still cluster', () => {
    const clusters = clusterAnnotationIndicators(
      [make('drums', 1000, 40), make('bass', 1500, 40)],
      0,
    );
    expect(clusters).toHaveLength(1);
    expect(clusters[0].x).toBe(40);
  });
});
