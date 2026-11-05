export const configureRemoteButtons = async (_mode: 'seek' | 'tracks' | 'off', _seconds: number, _previous: boolean, _next: boolean): Promise<void> => {};
export const subscribeToRemoteTrack = (_listener: (direction: 'previous' | 'next') => void) => () => {};

/** Web and unsupported-platform fallback: browser route changes are not exposed consistently. */
export const subscribeToOutputRouteUnavailable = (_listener: () => void): (() => void) => () => {};
