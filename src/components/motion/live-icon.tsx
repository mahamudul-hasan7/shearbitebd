"use client";

import { createElement, isValidElement, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { Bell, Bike, Building2, Camera, Check, CheckCheck, CheckCircle2, CircleCheck, ClipboardList, Clock, Compass, FileCheck2, HandHeart, HeartHandshake, History, Home, ImagePlus, LayoutDashboard, MapPin, Navigation, Package, PackageCheck, PackageOpen, PackageSearch, Plus, QrCode, Search, Settings, ShieldCheck, UploadCloud, UserRound, UsersRound, Utensils, createLucideIcon, type LucideIcon, type LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./live-icon.module.css";

// Keep the figures still while their working parts perform a small, complete action.
export const FoodBoxIcon = createLucideIcon("DashboardFoodBox", [
  ["path", { d:"M4 12h16l-1 7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z", fill:"currentColor", fillOpacity:".14", key:"box" }],
  ["path", { d:"M8 15h8", strokeOpacity:".5", key:"label" }],
  ["path", { d:"M7 11c0-2 2-4 4-2 1-3 5-2 6 2", className:`${styles.part} ${styles.food}`, key:"food" }],
  ["path", { d:"M3 11h18l-2-4H5Z", fill:"#fff", fillOpacity:".9", className:`${styles.part} ${styles.lid}`, key:"lid" }],
]);

export const WorkChecklistIcon = createLucideIcon("DashboardWorkChecklist", [
  ["rect", { x:"5", y:"4", width:"14", height:"18", rx:"2", fill:"currentColor", fillOpacity:".08", key:"board" }],
  ["rect", { x:"9", y:"2", width:"6", height:"4", rx:"1", fill:"#fff", key:"clip" }],
  ["path", { d:"M12 10h4m-4 4h4m-4 4h4", strokeOpacity:".55", key:"lines" }],
  ...[10,14,18].map((y,index) => ["path", { d:`m7.5 ${y} 1 1 1.7-2`, pathLength:"1", className:`${styles.part} ${styles.check} ${styles[`check${index + 1}`]}`, key:`check-${index}` }] as ["path", Record<string,string>]),
]);

export const ServingMealIcon = createLucideIcon("DashboardServingMeal", [
  ["path", { d:"M2 17h4v5H2Z", fill:"currentColor", fillOpacity:".16", key:"sleeve" }],
  ["path", { d:"M6 18h3l2 2h4l6-5a1.5 1.5 0 0 0-2-2l-5 3h-3", className:`${styles.part} ${styles.hand}`, key:"hand" }],
  ["path", { d:"M7 10h14l-2 4H9Z", fill:"currentColor", fillOpacity:".14", className:`${styles.part} ${styles.bowl}`, key:"bowl" }],
  ["path", { d:"M9 9c0-2 2-3 4-2 1-2 4-1 5 2", className:`${styles.part} ${styles.bowl}`, key:"meal" }],
]);

export const PeopleGreetingIcon = createLucideIcon("DashboardPeopleGreeting", [
  ["circle", { cx:"8", cy:"7", r:"3", fill:"currentColor", fillOpacity:".12", key:"head" }],
  ["path", { d:"M2 21v-3a6 6 0 0 1 12 0v3", key:"person" }],
  ["circle", { cx:"17", cy:"8", r:"2.5", fill:"currentColor", fillOpacity:".12", key:"second-head" }],
  ["path", { d:"M17 14a4 4 0 0 1 3 4v3", strokeOpacity:".7", key:"second-person" }],
  ["path", { d:"m18 15 3-3V8", className:`${styles.part} ${styles.wave}`, key:"greeting" }],
]);

export const RidingBikeIcon = Bike;

export const NotificationBellIcon = createLucideIcon("LiveNotificationBell", [
  ["path", { d:"M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", className:`${styles.part} ${styles.bell}`, key:"bell" }],
  ["path", { d:"M10 21h4", className:`${styles.part} ${styles.clapper}`, key:"clapper" }],
]);

export const ConfirmedIcon = createLucideIcon("LiveConfirmed", [
  ["circle", { cx:"12", cy:"12", r:"9", fill:"currentColor", fillOpacity:".06", key:"circle" }],
  ["path", { d:"m7.5 12 3 3 6-6", pathLength:"1", className:`${styles.part} ${styles.draw}`, key:"check" }],
]);
export const TickIcon = createLucideIcon("LiveTick", [
  ["path", { d:"m5 12 4 4L19 6", pathLength:"1", className:`${styles.part} ${styles.draw}`, key:"check" }],
]);

export const LocationPinIcon = createLucideIcon("LiveLocationPin", [
  ["path", { d:"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z", fill:"currentColor", fillOpacity:".07", key:"pin" }],
  ["circle", { cx:"12", cy:"10", r:"3", className:`${styles.part} ${styles.pinCenter}`, key:"center" }],
]);
export const SearchFoodIcon = createLucideIcon("LiveSearchFood", [
  ["circle", { cx:"10.5", cy:"10.5", r:"6.5", className:`${styles.part} ${styles.search}`, key:"lens" }],
  ["path", { d:"m16 16 5 5", key:"handle" }],
]);
export const OrganizationIcon = createLucideIcon("LiveOrganization", [
  ["path", { d:"M4 22V4l10-2v20M14 8h6v14M2 22h20", key:"building" }],
  ["path", { d:"M8 7h2m-2 4h2m-2 4h2m8-3h.01m-.01 4h.01", strokeOpacity:".65", key:"windows" }],
  ["path", { d:"M8 22v-4h3v4", className:`${styles.part} ${styles.door}`, key:"door" }],
]);
export const DashboardIcon = createLucideIcon("LiveDashboard", [
  ["rect", { x:"3", y:"3", width:"7", height:"7", rx:"1", className:`${styles.part} ${styles.tile}`, key:"first" }],
  ["rect", { x:"14", y:"3", width:"7", height:"7", rx:"1", key:"second" }],
  ["rect", { x:"3", y:"14", width:"7", height:"7", rx:"1", key:"third" }],
  ["rect", { x:"14", y:"14", width:"7", height:"7", rx:"1", className:`${styles.part} ${styles.tileLast}`, key:"fourth" }],
]);
export const AddPostIcon = createLucideIcon("LiveAddPost", [
  ["path", { d:"M5 12h14", key:"horizontal" }],
  ["path", { d:"M12 5v14", className:`${styles.part} ${styles.add}`, key:"vertical" }],
]);
export const RouteCompassIcon = createLucideIcon("LiveRouteCompass", [
  ["circle", { cx:"12", cy:"12", r:"9", key:"rim" }],
  ["path", { d:"m16 8-2 6-6 2 2-6Z", fill:"currentColor", fillOpacity:".12", className:`${styles.part} ${styles.needle}`, key:"needle" }],
]);
export const HistoryClockIcon = createLucideIcon("LiveHistoryClock", [
  ["path", { d:"M3 11a9 9 0 1 1 2.6 7M3 4v7h7", key:"rim" }],
  ["path", { d:"M12 7v5l3 2", className:`${styles.part} ${styles.clock}`, key:"hands" }],
]);
export const AccountIcon = createLucideIcon("LiveAccount", [
  ["circle", { cx:"12", cy:"7", r:"4", fill:"currentColor", fillOpacity:".08", className:`${styles.part} ${styles.nod}`, key:"head" }],
  ["path", { d:"M4 21v-2a8 8 0 0 1 16 0v2", key:"body" }],
]);
export const VerifiedShieldIcon = createLucideIcon("LiveVerifiedShield", [
  ["path", { d:"m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z", key:"shield" }],
  ["path", { d:"m8 12 3 3 5-6", pathLength:"1", className:`${styles.part} ${styles.draw}`, key:"check" }],
]);
export const SettingsIcon = createLucideIcon("LiveSettings", [
  ["path", { d:"M4 5h16M4 12h16M4 19h16", strokeOpacity:".55", key:"tracks" }],
  ["circle", { cx:"8", cy:"5", r:"2", fill:"var(--live-icon-surface,white)", className:`${styles.part} ${styles.slider}`, key:"first" }],
  ["circle", { cx:"16", cy:"12", r:"2", fill:"var(--live-icon-surface,white)", key:"second" }],
  ["circle", { cx:"10", cy:"19", r:"2", fill:"var(--live-icon-surface,white)", key:"third" }],
]);
export const CameraIcon = createLucideIcon("LiveCamera", [
  ["path", { d:"M4 6h3l2-3h6l2 3h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z", key:"body" }],
  ["circle", { cx:"12", cy:"13", r:"4", className:`${styles.part} ${styles.lens}`, key:"lens" }],
  ["path", { d:"M18 9h.01", key:"indicator" }],
]);
export const UploadPhotoIcon = createLucideIcon("LiveUploadPhoto", [
  ["path", { d:"M5 16a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 2 10", key:"cloud" }],
  ["path", { d:"M12 21V11m-4 4 4-4 4 4", className:`${styles.part} ${styles.upload}`, key:"arrow" }],
]);
export const HandoverCodeIcon = createLucideIcon("LiveHandoverCode", [
  ["path", { d:"M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5", key:"frame" }],
  ["path", { d:"M7 7h3v3H7Zm7 0h3v3h-3ZM7 14h3v3H7Zm7 0v3h3v-3", key:"code" }],
  ["path", { d:"M4 12h16", strokeOpacity:".55", className:`${styles.part} ${styles.scan}`, key:"scan" }],
]);

const equivalents = new Map<LucideIcon,LucideIcon>([
  [Package,FoodBoxIcon],[PackageSearch,FoodBoxIcon],[PackageOpen,FoodBoxIcon],[PackageCheck,FoodBoxIcon],
  [ClipboardList,WorkChecklistIcon],[HandHeart,ServingMealIcon],[HeartHandshake,ServingMealIcon],[Utensils,ServingMealIcon],
  [UsersRound,PeopleGreetingIcon],[Bell,NotificationBellIcon],
  [CheckCircle2,ConfirmedIcon],[CircleCheck,ConfirmedIcon],[Check,TickIcon],[ShieldCheck,VerifiedShieldIcon],
  [Building2,OrganizationIcon],[MapPin,LocationPinIcon],[Search,SearchFoodIcon],
  [LayoutDashboard,DashboardIcon],[Home,DashboardIcon],[Plus,AddPostIcon],
  [Compass,RouteCompassIcon],[Navigation,RouteCompassIcon],[History,HistoryClockIcon],[UserRound,AccountIcon],[Settings,SettingsIcon],
  [Clock,HistoryClockIcon],[Camera,CameraIcon],[ImagePlus,CameraIcon],[UploadCloud,UploadPhotoIcon],[FileCheck2,ConfirmedIcon],[CheckCheck,ConfirmedIcon],[QrCode,HandoverCodeIcon],
]);

export type LiveIconMotion = "interaction" | "ambient" | "once" | "still";
const liveFigures = new Set(equivalents.values());

export function ActionGlyph({ children, motion="interaction" }: { children:ReactNode; motion?:LiveIconMotion }) {
  if (isValidElement<LucideProps>(children) && (equivalents.has(children.type as LucideIcon) || liveFigures.has(children.type as LucideIcon))) {
    return <LiveIcon icon={children.type as LucideIcon} motion={motion} {...children.props} />;
  }
  return children;
}

export function LiveIcon({ icon, motion="interaction", signal, className, ...props }: LucideProps & { icon:LucideIcon; motion?:LiveIconMotion; signal?:string|number }) {
  const ref = useRef<SVGSVGElement>(null);
  const previousSignal = useRef(signal);
  const play = useRef<() => void>(()=>{});
  useEffect(() => {
    const element = ref.current;
    if (!element || motion !== "interaction") return;
    const trigger = element.closest<HTMLElement>("a,button,label,[data-live-trigger]");
    let timer:ReturnType<typeof setTimeout> | undefined;
    play.current = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || trigger?.matches(":disabled,[aria-disabled=true]")) return;
      clearTimeout(timer);
      element.dataset.liveMotion = "interaction";
      // Flush the finished pose so each deliberate interaction starts a fresh action.
      void element.getBoundingClientRect();
      element.dataset.liveMotion = "once";
      timer = setTimeout(()=>{ element.dataset.liveMotion = "interaction"; },1000);
    };
    const enter = (event:PointerEvent) => { if(event.pointerType === "mouse") play.current(); };
    const activate = () => play.current();
    trigger?.addEventListener("pointerenter",enter);
    trigger?.addEventListener("pointerdown",activate);
    trigger?.addEventListener("focus",activate);
    return () => {
      clearTimeout(timer);play.current = ()=>{};
      trigger?.removeEventListener("pointerenter",enter);
      trigger?.removeEventListener("pointerdown",activate);
      trigger?.removeEventListener("focus",activate);
    };
  },[motion,icon]);
  useEffect(() => {
    if (previousSignal.current !== undefined && signal !== undefined && signal !== previousSignal.current) play.current();
    previousSignal.current = signal;
  },[signal]);
  const iconProps = {...props,ref,className:cn(styles.icon,className),"data-live-icon":"true","data-live-motion":motion,"aria-hidden":true as const};
  // createElement stores this ref for React's commit; it never reads ref.current during render.
  // eslint-disable-next-line react-hooks/refs
  return createElement(equivalents.get(icon) ?? icon,iconProps);
}

export function LiveIconGroup({ children, className, paused=false, ...props }: HTMLAttributes<HTMLDivElement> & { paused?:boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = false;
    const sync = () => { element.dataset.motion = visible && !document.hidden && !paused ? "running" : "paused"; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange",sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange",sync); };
  },[paused]);

  return <div {...props} ref={ref} className={cn(className,styles.motion)} data-motion="paused">{children}</div>;
}
