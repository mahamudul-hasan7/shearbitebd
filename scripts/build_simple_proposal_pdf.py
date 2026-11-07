# -*- coding: utf-8 -*-
import os
import sys
import subprocess

html_content = """<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>ShareBite BD — প্রজেক্ট আইডিয়া প্রস্তাবনা</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;600;700;800;900&display=swap');

    @page {
      size: A4 portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Hind Siliguri', 'Kalpurush', 'SolaimanLipi', 'Shonar Bangla', 'Vrinda', 'Segoe UI', Arial, sans-serif;
      background-color: #ffffff;
      color: #1e293b;
      line-height: 1.6;
      font-size: 13px;
    }

    .page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      position: relative;
      background: #ffffff;
      padding: 16mm 18mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Header */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 2.5px solid #059669;
      margin-bottom: 14px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-name {
      font-family: 'Inter', sans-serif;
      font-size: 22px;
      font-weight: 900;
      color: #064e3b;
      letter-spacing: -0.5px;
    }

    .brand-name span {
      color: #059669;
    }

    .doc-tag {
      font-size: 11px;
      font-weight: 700;
      color: #047857;
      background: #ecfdf5;
      padding: 4px 12px;
      border-radius: 9999px;
      border: 1.5px solid #a7f3d0;
      letter-spacing: 0.3px;
    }

    /* Lead Box */
    .lead-box {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }

    .lead-box .tag {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #047857;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .lead-box p {
      font-size: 14px;
      font-weight: 600;
      color: #065f46;
      line-height: 1.55;
    }

    /* Section Header */
    .section-title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
      margin-bottom: 12px;
      padding-bottom: 5px;
      border-bottom: 1.5px solid #e2e8f0;
    }

    .section-title span.num {
      background: #059669;
      color: #ffffff;
      width: 26px;
      height: 26px;
      border-radius: 7px;
      display: inline-grid;
      place-items: center;
      font-size: 13px;
      font-weight: 800;
    }

    /* Problem Cards */
    .problem-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 14px;
    }

    .problem-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4.5px solid #e11d48;
      border-radius: 10px;
      padding: 10px 14px;
    }

    .problem-item strong {
      color: #9f1239;
      font-size: 13.5px;
      display: block;
      margin-bottom: 3px;
    }

    .problem-item p {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.55;
    }

    /* Core Problem Box */
    .core-problem-box {
      background: #fff1f2;
      border: 2px solid #fecdd3;
      border-radius: 10px;
      padding: 12px 15px;
      font-size: 13px;
      color: #881337;
      line-height: 1.55;
    }

    .core-problem-box strong {
      color: #be123c;
      font-size: 13.5px;
    }

    /* Solution Box */
    .solution-lead-box {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-radius: 10px;
      padding: 11px 15px;
      margin-bottom: 13px;
    }

    .solution-lead-box strong {
      color: #166534;
      font-size: 13px;
      display: block;
      margin-bottom: 3px;
    }

    .solution-lead-box p {
      color: #14532d;
      font-size: 13.5px;
      font-weight: 600;
      line-height: 1.5;
    }

    .solution-list {
      display: flex;
      flex-direction: column;
      gap: 11px;
    }

    .solution-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4.5px solid #059669;
      border-radius: 10px;
      padding: 11px 14px;
    }

    .solution-item strong {
      color: #065f46;
      font-size: 13.5px;
      display: block;
      margin-bottom: 4px;
    }

    .solution-item p {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.55;
    }

    /* Footer */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1.5px solid #e2e8f0;
      font-size: 10.5px;
      color: #64748b;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1: সমস্যা ও প্রেক্ষাপট ================= -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="brand-logo">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="16" fill="#059669"/>
            <path d="M22 36C20 33 19 30 19 26C19 20 23.5 16 28 16C30.5 16 32.5 17.5 33.5 19.5C34.5 17.5 36.5 16 39 16C43.5 16 48 20 48 26C48 30 46 34 42 38L33.5 46.5L25 38" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="46" cy="18" r="7" fill="#f59e0b"/>
          </svg>
          <div class="brand-name">ShareBite <span>BD</span></div>
        </div>
        <div class="doc-tag">প্রজেক্ট আইডিয়া প্রস্তাবনা</div>
      </div>

      <div class="lead-box">
        <div class="tag">💡 প্রজেক্টের আইডিয়া ও মূল প্রতিপাদ্য</div>
        <p>
          "ক্যাফেটেরিয়া বা রেস্তোরাঁর উদ্বৃত্ত খাবার নষ্ট না করে, মাত্র ৬০ সেকেন্ডে পোস্ট করে উবার-স্টাইলে ভলান্টিয়ারের মাধ্যমে ১৫-৩০ মিনিটের মধ্যে ক্ষুধার্ত মানুষের পাতে পৌঁছে দেওয়ার হাইপার-লোকাল স্মার্ট নেটওয়ার্ক।"
        </p>
      </div>

      <!-- SECTION 1: THE PROBLEM -->
      <div class="section-title">
        <span class="num">১</span>
        <span>সমস্যাটা আসলে কী? (The Problem)</span>
      </div>

      <div class="problem-list">
        <div class="problem-item">
          <strong>• খাবার অতিরিক্ত থাকে, কিন্তু ডাস্টবিনে যায়:</strong>
          <p>
            ক্যাম্পাসের ক্যাফেটেরিয়া (যেমন UIU সেন্ট্রাল ক্যাফেটেরিয়া), রেস্তোরাঁ ও বিয়ের মেজবানে প্রতিদিন ডেকচি ডেকচি ভালো ও গরম খাবার বেঁচে যায়। কাকে ফোন দেবে বা কীভাবে চ্যারিটিকে জানাবে—সেই উপায় না পেয়ে প্রতি রাতে এই ভালো খাবার ডাস্টবিনে বা ড্রেনে ফেলে দেওয়া হয়।
          </p>
        </div>

        <div class="problem-item">
          <strong>• চ্যারিটি সেন্টারের কাছে গাড়ি বা রাইডার থাকে না:</strong>
          <p>
            আশপাশের কোনো এতিমখানা বা লোকাল শেল্টারের হয়তো ১০০ জনের খাবার দরকার, কিন্তু রাত ১০টায় তাদের কাছে গিয়ে খাবার সংগ্রহ করার মতো নিজস্ব গাড়ি বা কর্মী থাকে না। ফলে কাছে থেকেও খাবারটি সংগ্রহ করা যায় না।
          </p>
        </div>

        <div class="problem-item">
          <strong>• অবিশ্বাসের ভয় (খাবার কি আসলেই মানুষের পেটে যাচ্ছে?):</strong>
          <p>
            অনেকে খাবার দিতে ভয় পায়—খাবার খেয়ে কেউ অসুস্থ হলে দায় কে নেবে? কিংবা খাবারটি আসলেই কোনো গরিব শিশু খেলো নাকি কেউ বাইরে বিক্রি করে দিলো? কোনো ডিজিটাল প্রমাণ বা সিকিউরিটি নেই।
          </p>
        </div>
      </div>

      <div class="core-problem-box">
        <strong>▶ মূল সমস্যা:</strong> ঢাকা শহরে খাবারের সংকট যতটা না আছে, তার চেয়ে বহুগুণ বড় সমস্যা হচ্ছে <em>অব্যবস্থাপনা ও দ্রুত যোগাযোগের প্রযুক্তির অভাব</em>। রান্নাঘর থেকে ক্ষুধার্ত মানুষের মুখ পর্যন্ত এই ৪ ঘণ্টার উইন্ডোতে সংযোগ করানোর মতো কোনো ডিজিটাল সিস্টেম নেই।
      </div>
    </div>

    <div class="footer-bar">
      <div>ShareBite BD &bull; স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক</div>
      <div>পৃষ্ঠা ১ / ২</div>
    </div>
  </div>

  <!-- ================= PAGE 2: আমাদের সমাধান ================= -->
  <div class="page">
    <div>
      <div class="doc-header">
        <div class="brand-logo">
          <div class="brand-name">ShareBite <span>BD</span> &bull; <span>আমাদের সমাধান</span></div>
        </div>
        <div class="doc-tag">The Solution</div>
      </div>

      <!-- SECTION 2: THE SOLUTION -->
      <div class="section-title">
        <span class="num">২</span>
        <span>আমাদের সমাধান কী? (The Solution)</span>
      </div>

      <div class="solution-lead-box">
        <strong>▶ এক লাইনে সমাধান:</strong>
        <p>
          "দাতা ৬০ সেকেন্ডে খাবারের লট পোস্ট করবে &rarr; নিকটস্থ এনজিও ম্যাপে দেখে ক্লেইম করবে &rarr; স্টুডেন্ট ভলান্টিয়ার উবারের মতো গিয়ে ওটিপি মিলিয়ে খাবার ডেলিভারি দিয়ে আসবে।"
        </p>
      </div>

      <div class="solution-list">
        <div class="solution-item">
          <strong>১. ৬০ সেকেন্ডে লিস্টিং ও AI সেফটি মিটার (লাইভ ডায়াল):</strong>
          <p>
            ডোনার শুধু খাবারের নাম ও রান্নার সময় লিখবে। লাইভ মিটার দেখাবে: <em>"খাদ্যের তাপমাত্রা: ৬৫°সে (নিরাপদ) | পিকআপের মেয়াদ আর মাত্র ২ ঘণ্টা বাকি"</em>। সাথে দেখাবে: <em>"৪০ কেজি বিরিয়ানি = ৮০-১০০ জন শিশুর খাবার"</em>।
          </p>
        </div>

        <div class="solution-item">
          <strong>২. রাডার ম্যাপ ভিউ ও ক্লোজ রেডিয়াস ফিল্টার (৩ কিমি / ৫ কিমি):</strong>
          <p>
            ঢাকার ট্রাফিকের কথা মাথায় রেখে এনজিওরা তাদের সেন্টারের ৩ কিমি বা ৫ কিমির মধ্যকার নিকটবর্তী খাবারগুলো ম্যাপে দেখতে পাবে এবং এক ক্লিকেই রিজার্ভ করতে পারবে। যেসব খাবারের মেয়াদ ২ ঘণ্টার নিচে নেমে যাবে, সেগুলো <em>'🚨 অতি জরুরি'</em> হিসেবে উপরে দেখাবে।
          </p>
        </div>

        <div class="solution-item">
          <strong>৩. উবার-স্টাইল ভলান্টিয়ার নেটওয়ার্ক (ক্যাম্পাস স্টুডেন্ট পাওয়ার):</strong>
          <p>
            নিকটস্থ বাইকার বা সাইক্লিস্ট স্টুডেন্টদের ফোনে নোটিফিকেশন যাবে। তারা সহজে ক্যাম্পাসের পথে বা বাসায় ফেরার পথে খাবারটি পিকআপ করে পার্শ্ববর্তী এতিমখানা বা চ্যারিটি শেল্টারে ড্রপ করে দিতে পারবে।
          </p>
        </div>

        <div class="solution-item" style="border-left-color: #2563eb;">
          <strong style="color: #1d4ed8;">৪. ৪-সংখ্যার ওটিপি ও কিউআর হ্যান্ডওভার (চুরি ও ফ্রড বন্ধ):</strong>
          <p>
            দাতা রাইডারের ফোনের ৪-ডিজিটের সিক্রেট ওটিপি (যেমন: ৭৪২৯) মিলিয়েই কেবল খাবার হস্তান্তর করবে। আর এতিমখানায় পৌঁছে এনজিও প্রতিনিধি কিউআর স্ক্যান করলেই ডেলিভারি সম্পন্ন হবে। ফলে কোনো খাবার চুরি বা অপব্যবহারের সুযোগ নেই।
          </p>
        </div>
      </div>
    </div>

    <div class="footer-bar">
      <div>ShareBite BD &bull; স্মার্ট উদ্বৃত্ত খাদ্য সুরক্ষা নেটওয়ার্ক</div>
      <div>পৃষ্ঠা ২ / ২ &bull; সম্পূর্ণ প্রপোজাল সামারি</div>
    </div>
  </div>

</body>
</html>
"""

workspace = os.getcwd()
html_path = os.path.join(workspace, "proposal_simple.html")
pdf_path = os.path.join(workspace, "ShareBite_BD_Project_Idea_Proposal.pdf")

with open(html_path, "wb") as f:
    f.write(html_content.encode("utf-8"))

print(f"Simple HTML written cleanly in binary UTF-8 ({len(html_content.encode('utf-8'))} bytes)")

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
args = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    "--no-pdf-header-footer",
    f"file:///{html_path.replace(os.sep, '/')}",
]

res = subprocess.run(args, capture_output=True, text=True)
if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"SUCCESS: Simple Proposal PDF created ({size_kb:.1f} KB) at {pdf_path}")
else:
    print(f"ERROR: PDF not found. Stderr: {res.stderr}")
    sys.exit(1)
