export function selectedNavigationHref(
  items: readonly { href: string }[],
  activeHref: string,
  pathname: string,
) {
  const exact = items.find((item) => item.href === activeHref);
  if (exact) return exact.href;
  return items
    .filter(
      (item) =>
        !item.href.includes("#") &&
        (pathname === item.href || pathname.startsWith(item.href + "/")),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function missionNavigation<T extends { href: string }>(
  items: T[],
  missionHref?: string,
): T[] {
  return missionHref
    ? items.map((item) =>
        item.href.endsWith("#active-mission")
          ? { ...item, href: missionHref }
          : item,
      )
    : items;
}
