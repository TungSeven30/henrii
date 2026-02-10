"use client";

import { useEffect } from "react";
import { useBabyStore, type Baby } from "@/stores/baby-store";

type ActiveBabyHydratorProps = {
  activeBabyId: string | null;
  activeBaby?: Baby | null;
};

export function ActiveBabyHydrator({ activeBabyId, activeBaby }: ActiveBabyHydratorProps) {
  const hydrateFromProfile = useBabyStore((state) => state.hydrateFromProfile);
  const setActiveBaby = useBabyStore((state) => state.setActiveBaby);

  useEffect(() => {
    hydrateFromProfile({
      defaultBabyId: activeBabyId,
      caregiverBabyIds: [],
    });
  }, [activeBabyId, hydrateFromProfile]);

  useEffect(() => {
    if (activeBaby) {
      setActiveBaby(activeBaby);
    }
  }, [activeBaby, setActiveBaby]);

  return null;
}
