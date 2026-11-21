import type { RescueRouteStage } from "./rescue-progress";
export type RescueActor = "donor" | "ngo" | "volunteer";
export function rescueNextStep({
  role,
  status,
  routeStage,
  receiptRecorded = false,
}: {
  role: RescueActor;
  status: string;
  routeStage?: RescueRouteStage;
  receiptRecorded?: boolean;
}) {
  if (status === "DISPUTED")
    return {
      title: "Rescue on hold",
      description:
        "An administrator must review the incident before this rescue can continue.",
      tone: "warning",
      action: undefined,
    };
  if (["CANCELLED", "EXPIRED"].includes(status))
    return {
      title: "Rescue closed",
      description:
        "This rescue cannot continue. Its saved checkpoints remain available.",
      tone: "neutral",
      action: undefined,
    };
  if (status === "DRAFT")
    return {
      title: "Draft saved",
      description:
        "Publish the donation when its food and collection details are ready.",
      tone: "neutral",
      action: undefined,
    };
  if (status === "DISTRIBUTED")
    return {
      title: "Distribution recorded",
      description:
        "The NGO has saved the distribution record. This food journey is complete.",
      tone: "success",
      action: undefined,
    };
  if (status === "DELIVERED") {
    if (role !== "ngo")
      return {
        title: "Delivery verified",
        description:
          "The handover is complete. The NGO records receipt and distribution next; delivery alone does not count as meals served.",
        tone: "success",
        action: undefined,
      };
    return receiptRecorded
      ? {
          title: "Record the distribution",
          description:
            "The delivery receipt is saved. Record the actual meals and recipients when food is distributed.",
          tone: "active",
          action: "DISTRIBUTION",
        }
      : {
          title: "Check the delivery",
          description:
            "Record the received quantity and condition before recording distribution.",
          tone: "active",
          action: "RECEIPT",
        };
  }
  if (role === "volunteer") {
    if (status === "PICKED_UP")
      return routeStage === "en_route_dropoff"
        ? {
            title: "Complete the delivery handover",
            description:
              "At the NGO, enter its six-digit delivery code after handing over the food.",
            tone: "active",
            action: "DELIVERY_CODE",
          }
        : {
            title: "Continue to the receiving NGO",
            description:
              "Pickup is verified. Keep the food in its declared storage conditions during transport.",
            tone: "active",
            action: "en_route_dropoff",
          };
    if (routeStage === "at_pickup")
      return {
        title: "Complete the pickup handover",
        description:
          "Check the food with the donor, then enter the donor's six-digit pickup code.",
        tone: "active",
        action: "PICKUP_CODE",
      };
    if (routeStage === "en_route_pickup")
      return {
        title: "Confirm arrival at the donor",
        description:
          "Use the saved pickup address and contact the donor if you need directions.",
        tone: "active",
        action: "at_pickup",
      };
    return {
      title: "Start your pickup trip",
      description:
        "Review the collection address, deadline and food storage before leaving.",
      tone: "active",
      action: "en_route_pickup",
    };
  }
  if (status === "PICKED_UP")
    return role === "ngo"
      ? {
          title: "Prepare for the delivery",
          description:
            "The volunteer has collected the food. Generate the delivery code when the food arrives.",
          tone: "active",
          action: "DELIVERY_CODE",
        }
      : {
          title: "Pickup verified",
          description:
            "The food is with the volunteer. The receiving NGO verifies the delivery next.",
          tone: "active",
          action: undefined,
        };
  if (status === "ASSIGNED")
    return role === "donor"
      ? {
          title: "Prepare the pickup handover",
          description:
            "Check the food with the assigned volunteer. Generate the pickup code when handing it over.",
          tone: "active",
          action: "PICKUP_CODE",
        }
      : {
          title: "Coordinate with the volunteer",
          description:
            "The donor provides the pickup code. You will provide a separate code at delivery.",
          tone: "active",
          action: undefined,
        };
  if (status === "RESERVED")
    return {
      title: "Waiting for a volunteer",
      description:
        "A verified volunteer must accept this rescue from the dispatch list.",
      tone: "active",
      action: undefined,
    };
  return {
    title: "Waiting for an NGO claim",
    description:
      "Your published food can be reserved by an eligible NGO before collection closes.",
    tone: "active",
    action: undefined,
  };
}

export function selectTrackingClaim<T extends { status: string }>(
  claims: T[],
  donationStatus: string,
): T | undefined {
  const active = claims.find(
    (claim) => !["CANCELLED", "EXPIRED"].includes(claim.status),
  );
  if (active) return active;
  if (["AVAILABLE", "PUBLISHED", "DRAFT"].includes(donationStatus))
    return undefined;
  return claims.find((claim) => claim.status === donationStatus);
}
