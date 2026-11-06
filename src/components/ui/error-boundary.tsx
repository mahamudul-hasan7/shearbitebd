"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PortalErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("PortalErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-2xs">
          <span className="grid size-12 mx-auto place-items-center rounded-2xl bg-rose-100 text-rose-700">
            <AlertTriangle className="size-6" />
          </span>
          <h3 className="mt-4 text-lg font-black text-slate-900 font-heading">
            একটি অপ্রত্যাশিত সমস্যা হয়েছে
          </h3>
          <p className="mt-1 text-xs text-slate-600 max-w-sm mx-auto">
            {this.props.fallbackMessage || "পৃষ্ঠার কম্পোনেন্ট লোড করার সময় ত্রুটি ঘটেছে। দয়া করে পুনরায় চেষ্টা করুন।"}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold font-heading cursor-pointer shadow-xs transition-colors"
          >
            <RefreshCw className="size-3.5" /> পুনরায় লোড করুন
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
