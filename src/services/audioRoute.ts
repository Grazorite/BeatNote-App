export const setRemoteSeekSeconds = async (_seconds: number): Promise<void> => {};

/** Web and unsupported-platform fallback: browser route changes are not exposed consistently. */
export const subscribeToOutputRouteUnavailable = (_listener: () => void): (() => void) => () => {};
