/** Web and unsupported-platform fallback: browser route changes are not exposed consistently. */
export const subscribeToOutputRouteUnavailable = (_listener: () => void): (() => void) => () => {};
