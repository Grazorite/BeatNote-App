import { useEffect, useState } from 'react';

import { snapshotAllows, v1PreviewEntitlementProvider } from './capabilityService';
import type { ProductCapability } from './types';

export const useProductCapability = (capability: ProductCapability): boolean => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    const update = (snapshot: Awaited<ReturnType<typeof v1PreviewEntitlementProvider.getSnapshot>>) => {
      if (active) setAllowed(snapshotAllows(snapshot, capability));
    };
    void v1PreviewEntitlementProvider.getSnapshot().then(update);
    const unsubscribe = v1PreviewEntitlementProvider.subscribe(update);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [capability]);

  return allowed;
};
