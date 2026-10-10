"use client";

import { useState } from "react";
import Script from "next/script";

// A facade for the help-chat widget: a plain button costs nothing, and the
// widget's script (and its 150 ms of start-up work) is only downloaded when
// someone actually asks for help.
export default function HelpChat() {
  const [wanted, setWanted] = useState(false);

  if (wanted) return <Script src="/chat-widget.js" strategy="afterInteractive" />;

  return (
    <button className="help-chat" onClick={() => setWanted(true)}>
      Need help?
    </button>
  );
}
