"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, CameraOff, Loader2, ScanLine } from "lucide-react";
import Webcam from "react-webcam";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardPageShell from "@/components/dashboard/DashboardPageShell";
import Button from "@/components/ui/Button";
import SelectField from "@/components/ui/SelectField";
import { dataUrlToFile, getCameraErrorMessage, getCameraLabel, getPreferredCameraId, getVideoConstraints, queryCameraPermission, requestCameraAccess } from "@/helpers/foodScanCamera";
import type { FoodScanAnalysis } from "@/helpers/foodScans";
import { scanFoodImage } from "@/lib/foodScanApi";
import type { FoodScanRecord } from "@/lib/mocks/foodScans";
import { showToast } from "@/lib/swal";
import { usePatientDashboardStore } from "@/store/patientDashboard";
import { getDashboardRole, isOperationalAdminRole } from "@/components/dashboard/navigation";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import FoodScanAnalysisView from "./FoodScanAnalysisView";

export default function FoodScanPage() {
  const router = useRouter();
  const userRole = useAuthStore((state) => state.user?.role);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const dashboardRole = getDashboardRole(userRole);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanRecord | null>(null);
  const [scanAnalysis, setScanAnalysis] = useState<FoodScanAnalysis | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<PermissionState | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState(0);
  const webcamRef = useRef<Webcam>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const setLastScan = usePatientDashboardStore((state) => state.setLastScan);

  const refreshCameraDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === "videoinput");
    setCameraDevices(videoDevices);

    if (!selectedCameraId && videoDevices.length > 0) setSelectedCameraId(getPreferredCameraId(videoDevices));
  }, [selectedCameraId]);

  const markCameraUnavailable = useCallback(() => {
    setIsCameraReady(false);
    setIsCameraStarting(false);
    setIsCameraEnabled(false);
    setCameraError("Akses kamera berubah. Izinkan kamera lalu klik Coba Kamera.");
  }, []);

  const retryCamera = useCallback(async () => {
    setIsCameraStarting(true);
    setCameraError(null);
    setIsCameraReady(false);

    const permission = await queryCameraPermission();
    setCameraPermission(permission);

    if (permission === "denied") {
      setCameraError("Izin kamera tidak diizinkan. Silahkan izinkan akses kamera terlebih dahulu.");
      setIsCameraReady(false);
      setIsCameraStarting(false);
      setIsCameraEnabled(false);
      return;
    }

    try {
      await requestCameraAccess();
      setCameraPermission("granted");
      await refreshCameraDevices();
      setIsCameraEnabled(true);
      setCameraKey((key) => key + 1);
    } catch (error) {
      setCameraError(getCameraErrorMessage(error instanceof DOMException ? error : undefined));
      setIsCameraEnabled(false);
      setIsCameraStarting(false);
    }
  }, [refreshCameraDevices]);

  useEffect(() => {
    const isBlockedRole = isOperationalAdminRole(dashboardRole) || dashboardRole === "super_admin";
    if (!hasAuthHydrated || !isBlockedRole) return;
    router.replace("/dashboard");
  }, [dashboardRole, hasAuthHydrated, router]);

  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;

    void (async () => {
      if (!("permissions" in navigator)) {
        setCameraPermission(null);
        return;
      }

      try {
        permissionStatus = await navigator.permissions.query({ name: "camera" as PermissionName });
        setCameraPermission(permissionStatus.state);
        permissionStatus.onchange = () => {
          const nextState = permissionStatus?.state ?? null;
          setCameraPermission(nextState);

          if (nextState === "denied") {
            markCameraUnavailable();
            return;
          }

          if (nextState === "granted") {
            setCameraError(null);
            setIsCameraStarting(true);
            setIsCameraEnabled(true);
            setCameraKey((key) => key + 1);
          }
        };
      } catch {
        setCameraPermission(null);
      }
    })();

    return () => {
      if (permissionStatus) permissionStatus.onchange = null;
    };
  }, [markCameraUnavailable]);

  useEffect(() => {
    const refreshCameraOnFocus = () => {
      if (cameraPermission !== "granted" || !isCameraEnabled || isCameraReady) return;
      setCameraError(null);
      setIsCameraStarting(true);
      setCameraKey((key) => key + 1);
    };

    window.addEventListener("focus", refreshCameraOnFocus);
    document.addEventListener("visibilitychange", refreshCameraOnFocus);

    return () => {
      window.removeEventListener("focus", refreshCameraOnFocus);
      document.removeEventListener("visibilitychange", refreshCameraOnFocus);
    };
  }, [cameraPermission, isCameraEnabled, isCameraReady]);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (!hasAuthHydrated || isOperationalAdminRole(dashboardRole) || dashboardRole === "super_admin") return null;

  const captureFoodImage = async () => {
    let screenshot = webcamRef.current?.getScreenshot({ width: 1280, height: 720 });

    if (!screenshot) {
      const video = (webcamRef.current as (Webcam & { video?: HTMLVideoElement }) | null)?.video ?? document.querySelector<HTMLVideoElement>('[data-food-scan-camera] video');
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        screenshot = canvas.toDataURL("image/jpeg", 0.92);
      }
    }

    if (!screenshot) throw new Error("Kamera belum siap.");
    return dataUrlToFile(screenshot, `food-scan-${Date.now()}.jpg`);
  };

  const runScan = async () => {
    if (isScanning) return;

    if (!isCameraEnabled) {
      retryCamera();
      return;
    }

    if (!isCameraReady) {
      showToast("Tunggu kamera aktif terlebih dahulu.", "warning");
      return;
    }

    setIsScanning(true);

    try {
      const file = await captureFoodImage();
      const analysis = await scanFoodImage(file);
      setScanAnalysis(analysis);
      setScanResult(analysis.scan);
      setLastScan(analysis.scan);
      showToast("Scan makanan selesai.", "success");
    } catch {
      setScanAnalysis(null);
      setScanResult(null);
      showToast("Scan makanan gagal.", "error");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Scan Makanan"
      />

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ScanInputCard
          cameraError={cameraError}
          cameraDevices={cameraDevices}
          isCameraEnabled={isCameraEnabled}
          isCameraReady={isCameraReady}
          isCameraStarting={isCameraStarting}
          isScanning={isScanning}
          cameraKey={cameraKey}
          selectedCameraId={selectedCameraId}
          onCameraReady={(stream) => {
            cameraStreamRef.current = stream;
            stream.getVideoTracks().forEach((track) => {
              track.onended = markCameraUnavailable;
              track.onmute = markCameraUnavailable;
            });
            setIsCameraReady(true);
            setIsCameraStarting(false);
            setCameraPermission("granted");
            setCameraError(null);
            void refreshCameraDevices();
          }}
          onCameraError={(error) => {
            setIsCameraReady(false);
            setIsCameraStarting(false);
            setIsCameraEnabled(false);
            setCameraError(getCameraErrorMessage(error));
          }}
          onRetryCamera={retryCamera}
          onScan={runScan}
          onSelectCamera={(deviceId) => {
            cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
            cameraStreamRef.current = null;
            setSelectedCameraId(deviceId);
            setIsCameraReady(false);
            setIsCameraStarting(true);
            setCameraKey((key) => key + 1);
          }}
          webcamRef={webcamRef}
        />
        <ScanResultPanel isScanning={isScanning} result={scanResult} analysis={scanAnalysis} />
      </div>
    </DashboardPageShell>
  );
}

function ScanInputCard({ cameraDevices, cameraError, cameraKey, isCameraEnabled, isCameraReady, isCameraStarting, isScanning, onCameraError, onCameraReady, onRetryCamera, onScan, onSelectCamera, selectedCameraId, webcamRef }: { readonly cameraDevices: MediaDeviceInfo[]; readonly cameraError: string | null; readonly cameraKey: number; readonly isCameraEnabled: boolean; readonly isCameraReady: boolean; readonly isCameraStarting: boolean; readonly isScanning: boolean; readonly onCameraError: (error: string | DOMException) => void; readonly onCameraReady: (stream: MediaStream) => void; readonly onRetryCamera: () => void; readonly onScan: () => void; readonly onSelectCamera: (deviceId: string) => void; readonly selectedCameraId: string | null; readonly webcamRef: RefObject<Webcam | null> }) {
  return (
    <motion.section
      className="overflow-visible rounded-[32px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
    >
      <div data-food-scan-camera className="relative flex h-64 items-center justify-center overflow-hidden rounded-[28px] bg-dark outline-2 outline-dashed outline-primary/45 sm:h-80">
        {isCameraEnabled && !cameraError && (
          <Webcam
            key={cameraKey}
            ref={webcamRef}
            audio={false}
            className="h-full w-full object-cover"
            disablePictureInPicture
            forceScreenshotSourceSize
            imageSmoothing
            muted
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={getVideoConstraints(selectedCameraId)}
            onUserMedia={onCameraReady}
            onUserMediaError={onCameraError}
          />
        )}

        {isCameraStarting && !isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/75 text-white">
            <Loader2 className="h-12 w-12 animate-spin" aria-hidden="true" />
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-dark/55 text-white backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-sm font-bold uppercase tracking-[0.14em]">Menganalisis makanan</p>
          </div>
        )}

        {(!isCameraEnabled || cameraError) && !isCameraStarting && !isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
            {cameraError ? <CameraOff className="h-12 w-12 text-danger" /> : <Camera className="h-12 w-12 text-primary" />}
            <div>
              <h2 className="font-display text-2xl font-extrabold tracking-[-0.05em] text-text-main">{cameraError ? "Kamera belum aktif" : "Aktifkan kamera"}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-muted">{cameraError || "Izinkan akses kamera agar bisa membantu deteksi makanan Anda."}</p>
            </div>
          </div>
        )}

        {isCameraEnabled && !cameraError && !isCameraStarting && !isCameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
            <Camera className="h-12 w-12 text-primary" />
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Menunggu kamera</p>
          </div>
        )}

      </div>

      <div className="mx-auto mt-6 flex w-full max-w-xl flex-col justify-center gap-3 min-[420px]:flex-row">
        {(!isCameraEnabled || cameraError) && (
          <Button type="button" size="sm" variant="outline" className="w-full min-w-0 min-[420px]:max-w-64" icon={<Camera size={16} />} loading={isCameraStarting} onClick={onRetryCamera}>
            {cameraError ? "Coba Kamera" : "Aktifkan Kamera"}
          </Button>
        )}
        <Button type="button" size="sm" className="w-full min-w-0 min-[420px]:max-w-64" icon={<ScanLine size={16} />} loading={isScanning} disabled={!isCameraReady} onClick={onScan}>
          Scan Sekarang
        </Button>
      </div>

      {isCameraEnabled && cameraDevices.length > 1 && (
        <div className="mx-auto mt-4 w-full max-w-xl">
          <label htmlFor="food-scan-camera" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted text-center">Pilih Kamera</label>
          <SelectField
            id="food-scan-camera"
            value={selectedCameraId ?? ""}
            options={cameraDevices.map((device, index) => ({ label: getCameraLabel(device, index), value: device.deviceId }))}
            className="h-12 w-full rounded-full border-0 bg-surface px-5 text-sm font-bold text-text-main outline-none transition-colors hover:bg-line/40"
            onChange={onSelectCamera}
          />
        </div>
      )}
    </motion.section>
  );
}

function ScanResultPanel({ isScanning, result, analysis }: { readonly isScanning: boolean; readonly result: FoodScanRecord | null; readonly analysis: FoodScanAnalysis | null }) {
  return (
    <motion.section
      className="min-h-[460px] rounded-[32px] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-8"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
    >
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div key="loading" className="flex h-full min-h-[420px] flex-col items-center justify-center gap-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.05em] text-text-main">AI sedang menganalisis</h2>
            <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-muted">Menganalisis makanan, mencocokkan jadwal obat aktif, dan menyusun rekomendasi.</p>
          </motion.div>
        ) : result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <FoodScanAnalysisView scanId={result.id} analysisData={analysis ?? undefined} />
          </motion.div>
        ) : (
          <motion.div key="empty" className="flex h-full min-h-[420px] flex-col items-center justify-center gap-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScanLine className="h-14 w-14 text-primary" />
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.05em] text-text-main">Belum ada hasil scan</h2>
            <p className="mt-6 max-w-md text-sm font-semibold leading-6 text-muted">Arahkan kamera ke makanan lalu klik “Scan Sekarang” untuk melihat hasil deteksi, analisis AI, dan rekomendasi.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
