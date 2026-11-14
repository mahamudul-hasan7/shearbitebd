"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useUiText } from "@/lib/i18n/use-ui-text";
import { cn } from "@/lib/utils";
import styles from "./hero-story.module.css";

export const HERO_INTERVAL_MS = 6_000;
export const HERO_SLIDES = [
  {src:"/images/hero/food-sharing.webp",label:"Food sharing",alt:"Volunteers packing extra meals in a community kitchen"},
  {src:"/images/hero/rider-collection.webp",label:"Rider collection",alt:"A volunteer rider with a bicycle and a food delivery bag"},
  {src:"/images/hero/ngo-distribution.webp",label:"NGO distribution",alt:"NGO volunteers handing a packed meal to a community member"},
] as const;

type StoryState = {index:number;ready:boolean[];requested:boolean[];failed:boolean[];pending?:number;revision:number};
type StoryAction = {type:"loaded"|"request"|"select"|"failed";index:number} | {type:"advance";from:number;index:number};
const initialState:StoryState = {index:0,ready:[false,false,false],requested:[true,false,false],failed:[false,false,false],revision:0};

function reducer(state:StoryState,action:StoryAction):StoryState {
  const index=action.index;
  if (action.type === "request") return state.requested[index] ? state : {...state,requested:state.requested.map((value,i)=>value || i===index)};
  if (action.type === "loaded") {
    if(state.ready[index]) return state;
    const switchToLoaded=state.pending===index || state.failed[state.index];
    return {...state,ready:state.ready.map((value,i)=>value || i===index),...(switchToLoaded ? {index,pending:undefined,revision:state.revision+1} : {})};
  }
  if (action.type === "failed") return {...state,failed:state.failed.map((value,i)=>value || i===index),pending:state.pending===index ? undefined : state.pending};
  if (action.type === "select") {
    if(state.failed[index]) return state;
    if(state.ready[index]) return {...state,index,pending:undefined,revision:state.revision+1};
    return {...state,pending:index,requested:state.requested.map((value,i)=>value || i===index)};
  }
  if(action.type !== "advance" || state.index !== action.from || state.pending !== undefined || !state.ready[index]) return state;
  return {...state,index,revision:state.revision+1};
}

function subscribeMotionPolicy(notify:()=>void) {
  const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
  document.addEventListener("visibilitychange",notify);
  preference.addEventListener("change",notify);
  return ()=>{document.removeEventListener("visibilitychange",notify);preference.removeEventListener("change",notify);};
}
function motionPolicy() {return !document.hidden && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;}

type StoryContext = {
  state:StoryState;cycling:boolean;paused:boolean;motionAllowed:boolean;
  dispatch:(action:StoryAction)=>void;togglePaused:()=>void;register:(element:HTMLElement)=>()=>void;
};
const Context=createContext<StoryContext | null>(null);
function useHeroStory() {const story=useContext(Context);if(!story) throw new Error("Hero story provider is missing");return story;}

export function HeroStoryProvider({children}:{children:ReactNode}) {
  const [state,dispatch]=useReducer(reducer,initialState);
  const [paused,setPaused]=useState(false);
  const [inView,setInView]=useState(false);
  const viewports=useRef(new Map<HTMLElement,boolean>());
  const motionAllowed=useSyncExternalStore(subscribeMotionPolicy,motionPolicy,()=>false);
  const register=useCallback((element:HTMLElement)=>{
    const entries=viewports.current;
    entries.set(element,false);
    const observer=new IntersectionObserver(([entry])=>{
      entries.set(element,entry.isIntersecting);
      setInView([...entries.values()].some(Boolean));
    });
    observer.observe(element);
    return ()=>{observer.disconnect();entries.delete(element);};
  },[]);
  const next=[1,2].map(offset=>(state.index+offset)%HERO_SLIDES.length).find(index=>!state.failed[index]);
  const cycling=motionAllowed && inView && !paused && state.pending===undefined && state.ready[state.index] && next!==undefined && state.ready[next];

  // Fetch the following image after the visible one is ready, outside the critical load.
  useEffect(()=>{
    if(!motionAllowed || !inView || paused || next===undefined || state.requested[next] || (!state.ready[state.index] && !state.failed[state.index])) return;
    const request=()=>dispatch({type:"request",index:next});
    if(typeof window.requestIdleCallback === "function") {
      const id=window.requestIdleCallback(request,{timeout:1500});
      return ()=>window.cancelIdleCallback(id);
    }
    const id=window.requestAnimationFrame(request);
    return ()=>window.cancelAnimationFrame(id);
  },[motionAllowed,inView,paused,next,state.requested,state.ready,state.failed,state.index]);

  // One timer drives both responsive views, the photograph and the slogan animation.
  useEffect(()=>{
    if(!cycling || next===undefined) return;
    const id=window.setTimeout(()=>dispatch({type:"advance",from:state.index,index:next}),HERO_INTERVAL_MS);
    return ()=>window.clearTimeout(id);
  },[cycling,next,state.index,state.revision]);

  const value=useMemo(()=>({state,cycling,paused,motionAllowed,dispatch,togglePaused:()=>setPaused(value=>!value),register}),[state,cycling,paused,motionAllowed,register]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function HeroStoryMedia({imageClassName}:{imageClassName?:string}) {
  const tx=useUiText();
  const {state,dispatch,register}=useHeroStory();
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const element=ref.current;if(element) return register(element);},[register]);
  return <div ref={ref} className={styles.media} role="img" aria-label={tx(HERO_SLIDES[state.index].alt)} data-testid="hero-story-media" data-slide={state.index}>
    {HERO_SLIDES.map((slide,index)=>state.requested[index] && !state.failed[index] && <Image key={slide.src} src={slide.src} alt="" aria-hidden="true" fill priority={index===0} loading={index===0 ? undefined : state.pending===index ? "eager" : "lazy"} sizes="100vw" draggable={false} className={cn(styles.image,imageClassName)} data-active={index===state.index} onLoad={()=>dispatch({type:"loaded",index})} onError={()=>dispatch({type:"failed",index})} />)}
  </div>;
}

export function HeroStoryControls({className}:{className?:string}) {
  const tx=useUiText();
  const {state,dispatch,paused,togglePaused,motionAllowed}=useHeroStory();
  return <div className={cn(styles.controls,className)} role="group" aria-label={tx("Landing photo controls")} data-testid="hero-story-controls">
    {HERO_SLIDES.map((slide,index)=><button key={slide.src} type="button" className={styles.dotButton} aria-label={tx("Show photo {0}: {1}",index+1,tx(slide.label))} aria-pressed={index===state.index} aria-busy={index===state.pending} disabled={state.failed[index]} onClick={()=>dispatch({type:"select",index})}><span className={styles.dot} /></button>)}
    <button type="button" className={styles.pauseButton} aria-label={tx(paused ? "Play slideshow" : "Pause slideshow")} aria-pressed={paused} disabled={!motionAllowed} onClick={togglePaused}>{paused || !motionAllowed ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}</button>
  </div>;
}

export function HeroSloganLine({children,className}:{children:string;className?:string}) {
  const {state,cycling}=useHeroStory();
  const text=children.replace(/[.।]+\s*$/u,"");
  return <span className={styles.sloganLine} data-testid="hero-slogan-line" data-slide={state.index} data-running={cycling}>
    <span className={styles.reserved} aria-hidden="true">{text}<i className={styles.cursorSpace} /></span>
    <span className={cn(styles.animatedLine,className)} aria-hidden="true">{text}<i className={styles.cursor} /></span>
    <span className="sr-only">{text}</span>
  </span>;
}
