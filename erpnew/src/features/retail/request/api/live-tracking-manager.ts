import {
  patchLiveLocationApi,
  startLiveTrackingApi,
  type TrackingCoordinate,
} from "./tracking-api";

const STORAGE_KEY = "active_live_tracking_transfer";
const PATCH_INTERVAL = 1000;

let watchId: number | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let lastPosition: TrackingCoordinate | null = null;
let activeTransferId: string | number | null = null;
let isPatching = false;
let lastPatchAt = 0;

function canUseBrowserLocation() {
  return typeof window !== "undefined" && "geolocation" in navigator;
}

function saveActiveTransfer(transferId: string | number) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      transferId,
      startedAt: Date.now(),
    })
  );
}

function clearActiveTransfer() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getSavedActiveTransferId() {
  if (typeof window === "undefined") return null;

  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return data?.transferId || null;
  } catch {
    return null;
  }
}

export function getCurrentBrowserPosition(): Promise<TrackingCoordinate> {
  return new Promise((resolve, reject) => {
    if (!canUseBrowserLocation()) {
      reject(new Error("Browser location is not supported."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      }
    );
  });
}

async function safePatchLocation() {
  if (!activeTransferId || !lastPosition || isPatching) return;

  const now = Date.now();

  if (now - lastPatchAt < PATCH_INTERVAL - 100) return;

  try {
    isPatching = true;
    lastPatchAt = now;

    await patchLiveLocationApi(activeTransferId, lastPosition);
  } catch (error) {
    console.error("Live location patch failed. Will retry.", error);
  } finally {
    isPatching = false;
  }
}

function startWatch() {
  if (!canUseBrowserLocation()) return;

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      lastPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
      };
    },
    (error) => {
      console.error("Location watch error:", error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    }
  );
}

function startPatchLoop() {
  if (intervalId) clearInterval(intervalId);

  intervalId = setInterval(() => {
    if (document.visibilityState === "visible") {
      safePatchLocation();
    }
  }, PATCH_INTERVAL);
}

export async function startTransferLiveTracking(transferId: string | number) {
  if (!transferId) throw new Error("Transfer id is required.");

  activeTransferId = transferId;
  saveActiveTransfer(transferId);

  const firstPosition = await getCurrentBrowserPosition();
  lastPosition = firstPosition;

  try {
    await startLiveTrackingApi(transferId, {
      start_lat: firstPosition.latitude,
      start_lng: firstPosition.longitude,
    });
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "";

    const alreadyStarted =
      message.toLowerCase().includes("in_transit") ||
      message.toLowerCase().includes("tracking");

    if (!alreadyStarted) {
      throw error;
    }
  }

  await safePatchLocation();
  startWatch();
  startPatchLoop();

  return true;
}

export function resumeSavedLiveTracking() {
  const savedTransferId = getSavedActiveTransferId();

  if (!savedTransferId) return;

  activeTransferId = savedTransferId;
  startWatch();
  startPatchLoop();
}

export function stopLocalLiveTracking() {
  if (watchId !== null && canUseBrowserLocation()) {
    navigator.geolocation.clearWatch(watchId);
  }

  if (intervalId) {
    clearInterval(intervalId);
  }

  watchId = null;
  intervalId = null;
  lastPosition = null;
  activeTransferId = null;
  clearActiveTransfer();
}