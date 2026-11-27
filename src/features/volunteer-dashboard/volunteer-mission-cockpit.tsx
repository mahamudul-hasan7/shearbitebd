"use client";
import { RescueMapDisclosure } from "@/components/rescue/rescue-map-disclosure";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, Navigation, QrCode, RefreshCw, X } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { useMockAuth } from "@/features/auth/mock-auth";
import { RescueLocationMap } from "@/components/maps/rescue-location-map";
import { RescueProgress } from "@/components/progress/rescue-progress";
import { RescueNextAction } from "@/components/rescue/rescue-next-action";
import { RescueContactCard } from "@/components/rescue/rescue-contact-card";
import { rescueNextStep } from "@/lib/rescue-next-step";
import { navigationUrl } from "@/lib/locations";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PortalShell } from "@/components/layout/portal-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVolunteerStore } from "./volunteer-store";
import type { MissionStage } from "./volunteer-types";
import { IncidentPanel } from "@/features/incidents/incident-panel";
import { ROUTES } from "@/lib/routes";
import styles from "@/components/rescue/rescue-coordination.module.css";
const ACTIONS: Partial<Record<MissionStage, string>> = {
  en_route_pickup: "Start pickup trip",
  at_pickup: "I have arrived at pickup",
  en_route_dropoff: "Start delivery trip",
};
export function VolunteerMissionCockpit({ missionId }: { missionId: string }) {
  const tx = useUiText(),
    { language } = useLanguage(),
    { session } = useMockAuth(),
    router = useRouter();
  const {
    activeMission,
    syncWithUserSession,
    loadMission,
    advanceStage,
    verifyOtp,
    releaseMission,
  } = useVolunteerStore();
  const owner = session?.role === "VOLUNTEER" ? session.id : undefined;
  const mission =
    owner &&
    activeMission?.volunteerProfileId === session?.volunteerProfileId &&
    (activeMission?.id === missionId || activeMission?.claimId === missionId)
      ? activeMission
      : null;
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [stale, setStale] = useState(false),
    [pinValue, setPinValue] = useState<{ key: string; value: string }>(),
    [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState<{ success: boolean; message: string }>();
  const [qrOpen, setQrOpen] = useState(false);
  const [qrPayload, setQrPayload] = useState("");
  const [cameraStatus, setCameraStatus] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const lock = useRef(false);

  useEffect(() => {
    if (!qrOpen) return;
    let stream: MediaStream | undefined;
    let timer: number | undefined;
    let cancelled = false;
    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus("Camera unavailable on this connection. Paste or scan QR string below.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraStatus("Camera active. Point at Donor/NGO QR code or paste payload below.");
        const Detector = (window as unknown as { BarcodeDetector?: new (opts?: { formats: string[] }) => { detect: (src: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>> } }).BarcodeDetector;
        if (Detector) {
          const detector = new Detector({ formats: ["qr_code"] });
          timer = window.setInterval(async () => {
            if (!videoRef.current || cancelled) return;
            try {
              const found = await detector.detect(videoRef.current);
              const raw = found[0]?.rawValue || "";
              const match = raw.match(/(\d{6})/);
              if (match) {
                setPinRef.current(match[1]);
                setQrOpen(false);
              }
            } catch {
              // Ignore transient frame decode errors.
            }
          }, 450);
        }
      } catch {
        if (!cancelled) setCameraStatus("Camera permission denied or unavailable. Enter/paste QR payload below.");
      }
    }
    void startCamera();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [qrOpen]);
  useEffect(() => {
    if (!owner) return;
    const controller = new AbortController();
    let inFlight = false;
    async function poll(initial = false) {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      try {
        if (initial)
          await syncWithUserSession(undefined, undefined, controller.signal);
        await loadMission(missionId, controller.signal);
        if (!controller.signal.aborted) setStale(false);
      } catch {
        if (!controller.signal.aborted) setStale(true);
      } finally {
        inFlight = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    const refresh = () => {
      if (document.visibilityState === "visible") void poll();
    };
    void poll(true);
    const timer = setInterval(refresh, 5000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [owner, missionId, revision, syncWithUserSession, loadMission]);
  const expired =
    !!mission?.safeDeadline && Date.parse(mission.safeDeadline) <= Date.now();
  const model = rescueNextStep({
    role: "volunteer",
    status: mission?.claimStatus || "ASSIGNED",
    routeStage: mission?.currentStage,
    expired,
  });
  const pinKey = `${owner}:${missionId}:${model.action}`;
  const pin = pinValue?.key === pinKey ? pinValue.value : "";
  const setPin = (value: string) => setPinValue({ key: pinKey, value });
  const setPinRef = useRef(setPin);
  setPinRef.current = setPin;
  const stageAction = Object.keys(ACTIONS).includes(model.action || "")
    ? (model.action as MissionStage)
    : undefined;
  const codeAction =
    model.action === "PICKUP_CODE" || model.action === "DELIVERY_CODE";
  const active =
    !!mission &&
    !mission.incidentPaused &&
    !(expired && mission.claimStatus === "PICKED_UP") &&
    !["CANCELLED", "EXPIRED", "DISPUTED", "DELIVERED", "DISTRIBUTED"].includes(
      mission.claimStatus || "",
    );
  const target =
    mission &&
    (mission.claimStatus === "PICKED_UP"
      ? mission.dropoffCoordinates
      : mission.pickupCoordinates);
  const locale = language === "bn" ? "bn-BD" : "en-BD";
  async function progress(stage: MissionStage) {
    if (lock.current || stale || !active) return;
    lock.current = true;
    setBusy(true);
    setNotice(undefined);
    try {
      await advanceStage(stage);
    } catch (error) {
      setStale(true);
      setNotice({
        success: false,
        message:
          error instanceof Error ? error.message : "Stage update failed.",
      });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function releaseAssignedMission() {
    if (lock.current || stale || !active || !mission || mission.claimStatus !== "ASSIGNED") return;
    lock.current = true;
    setBusy(true);
    setNotice(undefined);
    try {
      await releaseMission();
      router.push(ROUTES.volunteer.dispatches);
    } catch (error) {
      setNotice({
        success: false,
        message: error instanceof Error ? error.message : "Could not release mission.",
      });
      lock.current = false;
      setBusy(false);
    }
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    if (lock.current || stale || !active || !codeAction) return;
    lock.current = true;
    setBusy(true);
    setNotice(undefined);
    try {
      const result = await verifyOtp(pin);
      setNotice(result);
      if (result.success) setPin("");
    } catch (error) {
      setStale(true);
      setNotice({
        success: false,
        message:
          error instanceof Error ? error.message : "Verification failed.",
      });
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <PortalShell
      role="volunteer"
      activeHref={ROUTES.volunteer.mission(mission?.id || missionId)}
      title={tx("Rescue mission")}
      description={tx(
        "One clear next step, with server-verified pickup and delivery handovers.",
      )}
      profileName={session?.displayName || "Volunteer"}
      notificationHref={ROUTES.volunteer.notifications}
      backHref={ROUTES.volunteer.dispatches}
      backLabel={tx("Return to dispatches")}
      compactHeader
      actions={
        <Button
          variant="outline"
          onClick={() => setRevision((value) => value + 1)}
          leftIcon={<RefreshCw size={16} />}
        >
          {tx("Refresh")}
        </Button>
      }
    >
      <div className={styles.workspace}>
        {loading && !mission && (
          <LoadingSpinner label={tx("Loading assigned mission…")} />
        )}
        {stale && (
          <div role="alert" data-error="true" className={styles.notice}>
            <p>
              {tx(
                "Mission updates could not load. Refresh to reconnect before continuing.",
              )}
            </p>
            <Button
              variant="outline"
              onClick={() => setRevision((value) => value + 1)}
            >
              {tx("Try again")}
            </Button>
          </div>
        )}
        {!loading && !mission && !stale && (
          <div className={styles.notice}>
            <p>{tx("No assigned mission is available for this account.")}</p>
            <ButtonLink href={ROUTES.volunteer.dispatches}>
              {tx("Return to dispatches")}
            </ButtonLink>
          </div>
        )}
        {mission && (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryInfo}>
                <span className={styles.reference}>
                  {tx("Claim reference")} · {mission.claimId}
                </span>
                <h2>{mission.foodTitle}</h2>
                <p>
                  {mission.donorName} → {mission.ngoName}
                </p>
              </div>
            </div>
            <RescueNextAction model={model} stale={stale}>
              {active && stageAction && (
                <Button
                  disabled={busy || stale}
                  onClick={() => void progress(stageAction)}
                >
                  {tx(ACTIONS[stageAction])}
                </Button>
              )}
              {active && mission.claimStatus === "ASSIGNED" && (
                <Button
                  variant="outline"
                  disabled={busy || stale}
                  onClick={() => void releaseAssignedMission()}
                >
                  {tx("দায়িত্ব ছেড়ে দিন")}
                </Button>
              )}
              {active && target && (
                <a
                  className={styles.jump}
                  href={navigationUrl(
                    target,
                    mission.claimStatus === "PICKED_UP"
                      ? mission.pickupCoordinates
                      : undefined,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation size={16} />
                  {tx(
                    mission.claimStatus === "PICKED_UP"
                      ? "Navigate to NGO"
                      : "Navigate to pickup",
                  )}
                </a>
              )}
              {model.action === "REPORT_ISSUE" && (
                <ButtonLink
                  href={ROUTES.volunteer.reportIssue(mission.id)}
                  variant="danger"
                >
                  {tx("Report an issue / history")}
                </ButtonLink>
              )}
              {["DELIVERED", "DISTRIBUTED"].includes(
                mission.claimStatus || "",
              ) && (
                <ButtonLink href={ROUTES.volunteer.history} variant="outline">
                  {tx("View mission history")}
                </ButtonLink>
              )}
            </RescueNextAction>
            {notice && (
              <p
                role={notice.success ? "status" : "alert"}
                className={styles.notice}
                data-error={!notice.success}
              >
                {tx(notice.message)}
              </p>
            )}
            {active && codeAction && (
              <section
                className={styles.panel}
                id="mission-action"
                data-testid="mission-handover"
              >
                <div className={styles.panelHeader}>
                  <div>
                    <h2>
                      {tx(
                        model.action === "PICKUP_CODE"
                          ? "Verify pickup code"
                          : "Verify delivery code",
                      )}
                    </h2>
                    <p>
                      {tx(
                        model.action === "PICKUP_CODE"
                          ? "Ask the donor for the code when you receive the food."
                          : "Ask the NGO for its delivery code when you hand over the food.",
                      )}
                    </p>
                  </div>
                </div>
                <div className={styles.panelBody}>
                  <form className={styles.codeForm} onSubmit={verify}>
                    <Input
                      label={tx("Six-digit handover code")}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={pin}
                      disabled={busy || stale}
                      onChange={(event) =>
                        setPin(event.target.value.replace(/\D/g, ""))
                      }
                    />
                    <div className="flex flex-wrap gap-2.5">
                      <Button
                        type="submit"
                        disabled={busy || stale || pin.length !== 6}
                      >
                        {tx(
                          busy
                            ? "Verifying…"
                            : model.action === "PICKUP_CODE"
                              ? "Confirm pickup"
                              : "Confirm delivery",
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy || stale}
                        leftIcon={<QrCode className="size-4" />}
                        onClick={() => {
                          setQrPayload("");
                          setQrOpen(true);
                        }}
                      >
                        {tx("Scan handover QR")}
                      </Button>
                    </div>
                    <p className={styles.status}>
                      {tx(
                        "A code is single use. For an expired or locked code, ask its owner for a replacement.",
                      )}
                    </p>
                  </form>
                </div>
              </section>
            )}
            <div className={styles.grid}>
              <div className={styles.column}>
                <RescueProgress
                  scope="rider"
                  status={mission.claimStatus || "ASSIGNED"}
                  routeStage={mission.currentStage}
                  assignedAt={mission.assignedAt}
                  pickedUpAt={mission.pickedUpAt}
                  deliveredAt={mission.deliveredAt}
                  updatedAt={mission.updatedAt}
                  stale={stale}
                />
                <div className={styles.contacts}>
                  <RescueContactCard
                    title="Pickup from donor"
                    name={mission.donorName}
                    address={mission.donorAddress || mission.donorArea}
                    contact={mission.donorContact}
                    phone={mission.donorPhone}
                  />
                  <RescueContactCard
                    title="Deliver to NGO"
                    name={mission.ngoName}
                    address={mission.ngoAddress || mission.ngoArea}
                    contact={mission.ngoContact}
                    phone={mission.ngoPhone}
                  />
                </div>
              </div>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h2>{tx("Rescue essentials")}</h2>
                </div>
                <div className={styles.panelBody}>
                  <dl className={styles.facts}>
                    <div>
                      <dt>{tx("Estimated meals")}</dt>
                      <dd>{mission.servings.toLocaleString(locale)}</dd>
                    </div>
                    <div>
                      <dt>{tx("Storage condition")}</dt>
                      <dd>
                        {tx(
                          mission.storageCondition
                            .toLowerCase()
                            .replaceAll("_", " "),
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>{tx("Donor-declared safe deadline:")}</dt>
                      <dd>
                        {new Date(mission.safeDeadline).toLocaleString(locale)}
                      </dd>
                    </div>
                  </dl>
                  <ButtonLink
                    href={ROUTES.volunteer.reportIssue(mission.id)}
                    variant="outline"
                  >
                    {tx("Report an issue / history")}
                  </ButtonLink>
                </div>
              </section>
            </div>
            <RescueMapDisclosure>
              <RescueLocationMap
                pickup={mission.pickupCoordinates}
                delivery={mission.dropoffCoordinates}
                pickupLabel={[mission.donorAddress, mission.donorArea]
                  .filter(Boolean)
                  .join(", ")}
                deliveryLabel={[mission.ngoAddress, mission.ngoArea]
                  .filter(Boolean)
                  .join(", ")}
              />
            </RescueMapDisclosure>
            {mission.claimId && (
              <details className={styles.disclosure}>
                <summary>
                  {tx("Issues & rescue history")}
                  <ChevronDown size={17} />
                </summary>
                <div>
                  <IncidentPanel claimId={mission.claimId} />
                </div>
              </details>
            )}
          </>
        )}
      </div>
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="liquid-glass-card w-full max-w-md rounded-3xl border border-white/80 bg-white/82 backdrop-blur-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-ink-900">
                <Camera className="size-5 text-amber-700" />
                <span>{tx("Scan handover QR code")}</span>
              </div>
              <button
                type="button"
                aria-label={tx("Close")}
                onClick={() => setQrOpen(false)}
                className="grid size-8 place-items-center rounded-full hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 aspect-video relative grid place-items-center">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-emerald-400/80" />
            </div>
            <p className="text-xs text-muted-600">{tx(cameraStatus || "Initializing camera…")}</p>
            <div className="space-y-2">
              <Input
                label={tx("Or paste scanned QR URI / 6-digit code")}
                placeholder="sharebite://handover/.../123456"
                value={qrPayload}
                onChange={(e) => setQrPayload(e.target.value)}
              />
              <Button
                type="button"
                className="w-full"
                disabled={!qrPayload.match(/\d{6}/)}
                onClick={() => {
                  const match = qrPayload.match(/(\d{6})/);
                  if (match) {
                    setPin(match[1]);
                    setQrOpen(false);
                  }
                }}
              >
                {tx("Apply scanned code")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
