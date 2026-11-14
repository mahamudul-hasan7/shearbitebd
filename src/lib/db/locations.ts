import type { FoodRequest, Prisma } from "@prisma/client";
import type { Address } from "@/types/domain";
import { coordinates, isCoordinates } from "@/lib/locations";
import { addressDto } from "@/lib/db/profile";
import type { Address as AddressRow } from "@prisma/client";

// Older claims did not save a destination snapshot. Keep their text available,
// without treating a later profile pin as their confirmed historical destination.
export function legacyDeliveryAddress(addresses: AddressRow[]): Address | undefined {
  const address = addresses.find((item) => item.isPrimary) || addresses[0];
  return address ? { ...addressDto(address), coordinates: undefined } : undefined;
}

export function requestAddress(request: FoodRequest): Address {
  return { id: request.deliveryAddressId || request.id, label: "Food request delivery", city: request.deliveryCity,
    district: request.deliveryCity, division: request.deliveryCity, area: request.deliveryArea,
    addressLine: request.deliveryAddressLine, landmark: request.deliveryLandmark || undefined, isPrimary: false,
    coordinates: coordinates(request.deliveryLatitude, request.deliveryLongitude) };
}

export function savedDeliveryAddress(snapshot: Prisma.JsonValue | null): Address | undefined {
  if (!snapshot || Array.isArray(snapshot) || typeof snapshot !== "object") return undefined;
  if (typeof snapshot.id !== "string" || typeof snapshot.addressLine !== "string") return undefined;
  const value = snapshot as unknown as Address;
  return { ...value, coordinates: isCoordinates(value.coordinates) ? value.coordinates : undefined };
}
