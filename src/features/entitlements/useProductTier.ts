import { useEffect, useState } from 'react';

import { getCurrentTier, v1PreviewEntitlementProvider } from './capabilityService';
import type { ProductTier } from './types';

/** Subscribes to the active product tier. Used by the debug tier toggle in Settings. */
export const useProductTier = (): ProductTier => {
  const [tier, setTier] = useState<ProductTier>(getCurrentTier());

  useEffect(() => {
    let active = true;
    void v1PreviewEntitlementProvider.getSnapshot().then(snapshot => {
      if (active) setTier(snapshot.tier);
    });
    const unsubscribe = v1PreviewEntitlementProvider.subscribe(snapshot => {
      if (active) setTier(snapshot.tier);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return tier;
};
