"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import type { FoodScanAnalysis } from "@/helpers/foodScans";
import { getFoodScanAnalysisFromApi } from "@/lib/foodScanApi";
import FoodScanAnalysisView from "./FoodScanAnalysisView";

interface FoodScanDetailModalProps {
  readonly scanId: string | null;
  readonly onClose: () => void;
}

export default function FoodScanDetailModal({ scanId, onClose }: FoodScanDetailModalProps) {
  const [analysis, setAnalysis] = useState<FoodScanAnalysis | null>(null);

  useEffect(() => {
    if (!scanId) {
      return;
    }

    let isMounted = true;

    getFoodScanAnalysisFromApi(scanId)
      .then((nextAnalysis) => {
        if (isMounted) setAnalysis(nextAnalysis);
      })
      .catch(() => {
        if (isMounted) setAnalysis(null);
      });

    return () => {
      isMounted = false;
    };
  }, [scanId]);

  return (
    <Modal isOpen={Boolean(scanId)} title="Detail Scan Makanan" onClose={onClose}>
      {scanId && analysis?.scan.id === scanId && <FoodScanAnalysisView scanId={analysis.scan.id} imageSizes="(max-width: 768px) 100vw, 672px" analysisData={analysis} />}
    </Modal>
  );
}
