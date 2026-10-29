#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_SEED = 20261029;
const DEFAULT_DURATION_MS = 180000;
const HEADER = 'Layer,Marker Time (ms),Marker Time (seconds),Marker Time (bars:beats),Annotation';
const LAYERS = [
  ['Vocals', 'vocals'],
  ['Drums', 'drums'],
  ['Bass', 'bass'],
  ['Piano', 'piano'],
  ['Guitar', 'guitar'],
  ['Other', 'other'],
];
const DENSITIES = [0, 50, 500];

function readArgument(name, fallback) {
  const prefix = `--${name}=`;
  const value = process.argv.find(argument => argument.startsWith(prefix));
  return value === undefined ? fallback : value.slice(prefix.length);
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function csvEscape(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function makeMarkers(count, durationMs, seed) {
  if (count === 0) return [];
  const random = seededRandom(seed + count);
  const usableStart = 1000;
  const usableEnd = Math.max(usableStart, durationMs - 1000);
  const span = Math.max(1, usableEnd - usableStart);
  return Array.from({ length: count }, (_, index) => {
    const evenPosition = usableStart + (span * (index + 1)) / (count + 1);
    const jitterLimit = Math.min(100, span / Math.max(1, count * 4));
    const timestamp = Math.round(evenPosition + (random() - 0.5) * jitterLimit);
    const [layerName, layerId] = LAYERS[index % LAYERS.length];
    const annotated = index % 5 === 0;
    return {
      annotation: annotated ? `Performance fixture marker ${index + 1}` : '',
      layerId,
      layerName,
      timestamp,
    };
  });
}

function writeProject(outputDirectory, songId, durationMs, seed, count) {
  const markers = makeMarkers(count, durationMs, seed);
  const baseName = `${songId}-${count}-markers`;
  const rows = markers.map(marker => [
    marker.layerName,
    marker.timestamp,
    (marker.timestamp / 1000).toFixed(3),
    '',
    marker.annotation,
  ].map(csvEscape).join(','));
  fs.writeFileSync(path.join(outputDirectory, `${baseName}.csv`), `${[HEADER, ...rows].join('\n')}\n`);

  const descriptor = {
    schemaVersion: 1,
    generatorSeed: seed,
    songId,
    durationMs,
    markerCount: count,
    annotationCount: markers.filter(marker => marker.annotation.length > 0).length,
    settings: {
      bpm: 120,
      beatAnchorMs: 0,
      showDanceCounts: true,
      countSize: 8,
      loopRange: {
        startMs: Math.round(durationMs * 0.25),
        endMs: Math.round(durationMs * 0.5),
      },
    },
    layers: Object.fromEntries(LAYERS.map(([, layerId]) => [layerId, {
      markers: markers.filter(marker => marker.layerId === layerId).map(marker => marker.timestamp),
      annotations: markers
        .filter(marker => marker.layerId === layerId && marker.annotation.length > 0)
        .map(marker => ({ timestamp: marker.timestamp, text: marker.annotation })),
    }])),
  };
  fs.writeFileSync(
    path.join(outputDirectory, `${baseName}.json`),
    `${JSON.stringify(descriptor, null, 2)}\n`,
  );
}

const durationMs = Number.parseInt(readArgument('duration-ms', String(DEFAULT_DURATION_MS)), 10);
const seed = Number.parseInt(readArgument('seed', String(DEFAULT_SEED)), 10);
const songId = readArgument('song-id', 's-medium');
const outputDirectory = path.resolve(readArgument('out', '/tmp/beatnote-performance-projects'));

if (!Number.isFinite(durationMs) || durationMs <= 2000) {
  throw new Error('--duration-ms must be an integer greater than 2000');
}
if (!Number.isFinite(seed)) throw new Error('--seed must be an integer');
if (!/^[a-z0-9-]+$/i.test(songId)) throw new Error('--song-id must use letters, numbers, and hyphens');

fs.mkdirSync(outputDirectory, { recursive: true });
DENSITIES.forEach(count => writeProject(outputDirectory, songId, durationMs, seed, count));
process.stdout.write(`Generated ${DENSITIES.length} reference project pairs in ${outputDirectory}\n`);
