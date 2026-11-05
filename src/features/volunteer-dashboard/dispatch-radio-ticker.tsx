"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Headphones,
  MessageSquare,
  Mic,
  Radio,
  Send,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";
import { cn } from "@/lib/utils";

interface RadioMessage {
  id: string;
  sender: string;
  role: "hq" | "donor" | "ngo" | "rider";
  time: string;
  textEn: string;
  textBn: string;
}

const INITIAL_MESSAGES: RadioMessage[] = [
  {
    id: "msg-1",
    sender: "Dhaka Central HQ Dispatcher",
    role: "hq",
    time: "10:46 PM",
    textEn:
      "Alert Squad Rider Tanvir: Moderate traffic near Rampura bridge. Advise taking the Hatirjheel North circular link toward Panthapath.",
    textBn:
      "সতর্কবার্তা রাইডার তানভীর: রামপুরা ব্রিজের কাছে সামান্য জ্যাম রয়েছে। পান্থপথ যেতে হাতিরঝিল উত্তর লিংক ব্যবহারের পরামর্শ দেওয়া হলো।",
  },
  {
    id: "msg-2",
    sender: "UIU Cafeteria Manager (Asif)",
    role: "donor",
    time: "10:38 PM",
    textEn:
      "All 85 foil trays of Kacchi & Roast are packed in thermal carton. We also added 15 fruit custards as bonus for Mastul kids.",
    textBn:
      "কাচ্চি ও রোস্টের ৮৫টি ফয়েল বক্স থার্মাল কার্টনে প্যাক করা হয়েছে। মাস্তুলের শিশুদের জন্য অতিরিক্ত ১৫টি ফ্রুট কাস্টার্ড যুক্ত করা হলো।",
  },
  {
    id: "msg-3",
    sender: "Mastul Foundation Dispatch (Farhana)",
    role: "ngo",
    time: "10:25 PM",
    textEn:
      "Shelter volunteers are ready at Dhanmondi 32 gate with trolley carts. Security PIN 7429 has been verified on our terminal.",
    textBn:
      "ধানমন্ডি ৩২ এর গেটে আমাদের ৪ জন স্বেচ্ছাসেবক ট্রলি সহ অপেক্ষায় আছেন। টার্মিনালে সিকিউরিটি পিন ৭৪২৯ প্রস্তুত রয়েছে।",
  },
];

export function DispatchRadioTicker() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [messages, setMessages] = useState<RadioMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [muted, setMuted] = useState(false);

  function handleSendMessage() {
    if (!inputText.trim()) return;
    const newMessage: RadioMessage = {
      id: `msg-${Date.now()}`,
      sender: isBn ? "রাইডার তানভীর (আপনি)" : "Rider Tanvir (You)",
      role: "rider",
      time: "Just now",
      textEn: inputText,
      textBn: inputText,
    };
    setMessages((prev) => [newMessage, ...prev]);
    setInputText("");
  }

  return (
    <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-surface shadow-md">
      {/* Radio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-slate-50/80 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700">
            <Radio className="size-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-xs font-black uppercase tracking-wider text-ink-900">
                {isBn ? "লাইভ রেসকিউ ওয়াকি-টকি ও ডিসপ্যাচ ফিড" : "Live Dispatch Radio Feed"}
              </h3>
              <span className="flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                <Wifi className="size-2.5" /> 144.80 MHz
              </span>
            </div>
            <p className="text-[11px] text-muted-600">
              {isBn
                ? "ঢাকা সেন্ট্রাল ডিসপ্যাচ, দাতা কর্তৃপক্ষ ও এনজিও কন্ট্রোলের সাথে তাৎক্ষণিক যোগাযোগ"
                : "Continuous comms link between Central HQ, Donors and NGO Receivers"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMuted(!muted)}
          className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-bold text-ink-700 hover:bg-slate-100 transition-colors"
        >
          {muted ? <VolumeX className="size-3.5 text-muted-400" /> : <Volume2 className="size-3.5 text-emerald-600" />}
          <span>{muted ? (isBn ? "নিঃশব্দ" : "Muted") : (isBn ? "লাইভ অডিও" : "Audio On")}</span>
        </button>
      </div>

      {/* Message List */}
      <div className="max-h-64 divide-y divide-line/60 overflow-y-auto p-2">
        {messages.map((msg) => (
          <div key={msg.id} className="p-3 transition-colors hover:bg-slate-50/60 rounded-xl">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
                    msg.role === "hq"
                      ? "bg-emerald-100 text-emerald-800"
                      : msg.role === "donor"
                      ? "bg-amber-100 text-amber-800"
                      : msg.role === "ngo"
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-800 text-white"
                  )}
                >
                  {msg.role === "hq"
                    ? "HQ Command"
                    : msg.role === "donor"
                    ? "Donor UIU"
                    : msg.role === "ngo"
                    ? "NGO Mastul"
                    : "Rider"}
                </span>
                <span className="font-bold text-ink-900">{msg.sender}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-500">{msg.time}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-800 pl-1 font-medium">
              {isBn ? msg.textBn : msg.textEn}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Transmit Input */}
      <div className="border-t border-line bg-slate-50/50 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              isBn
                ? "ডিসপ্যাচ বা এনজিওকে বার্তা পাঠান (যেমন: হাতিরঝিলে অবস্থান করছি)..."
                : "Broadcast status to HQ & NGO (e.g., crossing Rampura bridge)..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="h-9 flex-1 rounded-xl border border-line bg-white px-3 text-xs text-ink-900 placeholder:text-muted-400 focus:border-brand-500 focus:outline-hidden"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            className="shrink-0"
            rightIcon={<Send className="size-3.5" />}
          >
            {isBn ? "পাঠান" : "Transmit"}
          </Button>
        </form>
      </div>
    </div>
  );
}