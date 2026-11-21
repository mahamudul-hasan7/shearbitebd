"use client";
import { useEffect, useRef, useState } from "react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { useLanguage } from "@/lib/i18n/language-context";
import { Button } from "@/components/ui/button";
import {
  handoverService,
  type HandoverChallengeState,
  type HandoverKind,
} from "@/services/handover.service";
import styles from "@/components/rescue/rescue-coordination.module.css";
export function HandoverCodePanel({
  claimId,
  kind,
}: {
  claimId: string;
  kind: HandoverKind;
}) {
  const tx = useUiText(),
    { language } = useLanguage(),
    key = `${claimId}:${kind}`;
  const [snapshot, setSnapshot] = useState<{
    key: string;
    challenge?: HandoverChallengeState;
    error?: string;
  }>();
  const [issued, setIssued] = useState<{
    key: string;
    code: string;
    expiresAt: string;
    reissueAfter: string;
  }>();
  const [busy, setBusy] = useState(false),
    [now, setNow] = useState(0),
    [revision, setRevision] = useState(0);
  const lock = useRef(false),
    readVersion = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    async function refresh() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true;
      const version = ++readVersion.current;
      try {
        const data = await handoverService.state(claimId, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted && version === readVersion.current)
          setSnapshot({
            key,
            challenge: data.challenges.find((c) => c.kind === kind),
          });
      } catch (error) {
        if (!controller.signal.aborted && version === readVersion.current)
          setSnapshot((previous) => ({
            key,
            challenge: previous?.key === key ? previous.challenge : undefined,
            error:
              error instanceof Error
                ? error.message
                : "Code status could not load.",
          }));
      } finally {
        inFlight = false;
      }
    }
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const initial = setTimeout(() => {
        setNow(Date.now());
        void refresh();
      }, 0),
      clock = setInterval(() => setNow(Date.now()), 1000),
      timer = setInterval(visible, 5000);
    window.addEventListener("focus", visible);
    return () => {
      controller.abort();
      clearTimeout(initial);
      clearInterval(clock);
      clearInterval(timer);
      window.removeEventListener("focus", visible);
    };
  }, [claimId, kind, key, revision]);
  const current = snapshot?.key === key ? snapshot : undefined,
    challenge = current?.challenge,
    code = issued?.key === key ? issued : undefined;
  const number = (value: number) =>
    value.toLocaleString(language === "bn" ? "bn-BD" : "en-BD");
  const seconds = code
    ? Math.max(0, Math.ceil((Date.parse(code.expiresAt) - now) / 1000))
    : 0;
  const cooldown = challenge?.reissueAfter
    ? Math.max(0, Math.ceil((Date.parse(challenge.reissueAfter) - now) / 1000))
    : 0;
  const consumed = !!challenge?.consumedAt,
    matching = !!code && code.reissueAfter === challenge?.reissueAfter;
  const visible =
    matching &&
    !current?.error &&
    challenge?.canIssue &&
    !consumed &&
    challenge.attemptsRemaining > 0 &&
    seconds > 0;
  async function generate() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setIssued(undefined);
    ++readVersion.current;
    try {
      const result = await handoverService.issue(claimId, kind);
      setIssued({ key, ...result });
      setNow(Date.now());
      setRevision((value) => value + 1);
    } catch (error) {
      setSnapshot((previous) => ({
        key,
        challenge: previous?.key === key ? previous.challenge : undefined,
        error:
          error instanceof Error ? error.message : "Code could not be created.",
      }));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      className={styles.panel}
      id="handover"
      data-testid="handover-owner"
    >
      <div className={styles.panelHeader}>
        <div>
          <h2>
            {tx(
              kind === "PICKUP"
                ? "Pickup handover code"
                : "Delivery handover code",
            )}
          </h2>
          <p>
            {tx(
              "Share this code only when handing over the food to the assigned volunteer.",
            )}
          </p>
        </div>
      </div>
      <div className={styles.panelBody}>
        {!current && <p role="status">{tx("Checking handover status…")}</p>}
        {current?.error && (
          <div role="alert">
            <p>{tx(current.error)}</p>
            <Button
              variant="outline"
              onClick={() => setRevision((value) => value + 1)}
            >
              {tx("Refresh code status")}
            </Button>
          </div>
        )}
        {consumed ? (
          <p className="font-semibold text-brand-800">
            {tx("Handover verified ✓")}
          </p>
        ) : (
          <>
            {visible && (
              <div className="rounded-2xl bg-brand-50 p-5 text-center">
                <p
                  aria-label={tx("Six digit handover code")}
                  className="select-all font-mono text-4xl font-bold tracking-widest"
                >
                  {code!.code}
                </p>
                <p className="mt-3 text-sm" role="timer" aria-live="off">
                  {tx(
                    "Code valid for {0}:{1}",
                    number(Math.floor(seconds / 60)),
                    (seconds % 60).toLocaleString(
                      language === "bn" ? "bn-BD" : "en-BD",
                      { minimumIntegerDigits: 2, useGrouping: false },
                    ),
                  )}
                </p>
              </div>
            )}
            {code && !visible && !current?.error && (
              <p>
                {tx(
                  matching && seconds === 0
                    ? "Code expired. Generate a replacement."
                    : "The code is not currently usable. Refresh its status or generate a replacement when available.",
                )}
              </p>
            )}
            {challenge && !challenge.canIssue && (
              <p>
                {tx(
                  "This handover is not ready. Check the rescue stage and collection deadline.",
                )}
              </p>
            )}
            {challenge?.issuedAt && !code && (
              <p>
                {tx(
                  "Code শুধু তৈরির সময় দেখানো হয়। প্রয়োজন হলে replacement তৈরি করুন।",
                )}
              </p>
            )}
            {challenge && (
              <Button
                disabled={
                  busy ||
                  !!current?.error ||
                  !challenge.canIssue ||
                  cooldown > 0
                }
                onClick={() => void generate()}
              >
                {tx(
                  busy
                    ? "Creating…"
                    : challenge.issuedAt
                      ? "Generate replacement code"
                      : "Generate six-digit code",
                )}
              </Button>
            )}
            {cooldown > 0 && (
              <p className={styles.status}>
                {tx("Replacement available in {0} seconds", number(cooldown))}
              </p>
            )}
            {challenge?.issuedAt && (
              <p className={styles.status}>
                {tx(
                  "{0} verification attempts remain",
                  number(challenge.attemptsRemaining),
                )}
              </p>
            )}
            <p className={styles.status}>
              {tx(
                "Codes are single use and valid for up to 10 minutes, within the donor's handover deadline.",
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}
