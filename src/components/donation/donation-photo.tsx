"use client";

import { useUiText } from "@/lib/i18n/use-ui-text";
import Image, { type ImageProps } from "next/image";
import { donationImageUrl } from "@/features/donations/donation-presentation";
import { sampleDonationImage } from "@/lib/sample-donation-images";
import type { DonationView } from "@/types/domain";

export function DonationPhoto({
  donation,
  hideSampleBadge = false,
  ...props
}: { donation: DonationView; hideSampleBadge?: boolean } & Omit<ImageProps, "src" | "alt" | "unoptimized">) {
  const tx = useUiText();
  const src = donationImageUrl(donation);
  const sample = sampleDonationImage(donation.sampleImageId);
  const isSample = Boolean(sample && sample.url === src);
  const compactThumb =
    hideSampleBadge ||
    /(^|[\s,])(56|72|80|94|96|112)px$/.test(props.sizes ?? "");
  return <>
    <Image {...props} src={src} alt={isSample ? tx("Sample image: {0} — illustrative, not an uploaded food photo", tx(sample!.label)) : src.endsWith(".svg") ? tx("Photo not provided") : donation.title} unoptimized={src.startsWith("/api/photos/")} />
    {isSample && !compactThumb && <span className="pointer-events-none absolute bottom-2 left-2 z-10 max-w-[calc(100%-1rem)] truncate whitespace-nowrap rounded-full border border-white/20 bg-slate-950/65 px-2.5 py-0.5 text-[11px] font-medium text-white/95 backdrop-blur-xs">{tx("Sample photo")}</span>}
  </>;
}
