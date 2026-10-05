import type { LayerId } from '../hooks/useStudioStore';

export interface AnnotationIndicator {
  layerId: LayerId;
  color: string;
  timestamp: number;
  x: number;
}

export interface AnnotationCluster {
  x: number;
  members: AnnotationIndicator[];
}

function normalizeThreshold(thresholdPx: number): number {
  return Number.isFinite(thresholdPx) && thresholdPx >= 0 ? thresholdPx : 0;
}

function compareIndicators(a: AnnotationIndicator, b: AnnotationIndicator): number {
  if (a.x !== b.x) return a.x < b.x ? -1 : 1;
  if (a.timestamp !== b.timestamp) return a.timestamp < b.timestamp ? -1 : 1;
  if (a.layerId !== b.layerId) return a.layerId < b.layerId ? -1 : 1;
  return 0;
}

export function clusterAnnotationIndicators(
  indicators: AnnotationIndicator[],
  thresholdPx = 8,
): AnnotationCluster[] {
  if (!Array.isArray(indicators) || indicators.length === 0) return [];

  const threshold = normalizeThreshold(thresholdPx);
  const valid = indicators.filter(
    (indicator) => indicator != null
      && Number.isFinite(indicator.x)
      && Number.isFinite(indicator.timestamp),
  );
  const sorted = [...valid].sort(compareIndicators);

  const clusters: AnnotationCluster[] = [];
  let current: AnnotationCluster | null = null;

  for (const indicator of sorted) {
    if (current === null || indicator.x - current.members[0].x > threshold + Number.EPSILON) {
      current = { x: indicator.x, members: [indicator] };
      clusters.push(current);
    } else {
      current.members.push(indicator);
      current.x = current.members.reduce((sum, member) => sum + member.x, 0) / current.members.length;
    }
  }

  return clusters;
}
