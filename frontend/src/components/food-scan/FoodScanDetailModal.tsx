"use client";

import Modal from "@/components/ui/Modal";
import { getFoodScanAnalysis } from "@/helpers/foodScans";
import FoodScanAnalysisView from "./FoodScanAnalysisView";

interface FoodScanDetailModalProps {
  readonly scanId: string | null;
  readonly onClose: () => void;
}

export default function FoodScanDetailModal({ scanId, onClose }: FoodScanDetailModalProps) {
  const analysis = scanId ? getFoodScanAnalysis(scanId) : null;

  return (
    <Modal isOpen={Boolean(scanId && analysis)} title="Detail Scan Makanan" onClose={onClose}>
      {analysis && <FoodScanAnalysisView scanId={analysis.scan.id} imageSizes="(max-width: 768px) 100vw, 672px" />}
    </Modal>
  );
}
