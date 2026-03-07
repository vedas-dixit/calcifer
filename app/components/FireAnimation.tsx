"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import fireData from "@/public/fire/Fire.json";

/* Avoid SSR — Lottie touches window/document */
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface FireAnimationProps {
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  showEyes?: boolean;
}

export function FireAnimation({
  width = 80,
  height = 80,
  className = "",
  style,
  showEyes = false,
}: FireAnimationProps) {
  const eyeSize   = Math.round(width * 0.20);
  const pupilSize = Math.round(eyeSize * 0.42);
  const eyeGap    = Math.round(eyeSize * 0.45);
  const eyeBottom = "26%";

  return (
    <div
      className={className}
      style={{ width, height, flexShrink: 0, position: "relative", ...style }}
    >
      <Lottie
        animationData={fireData}
        loop
        style={{ width: "100%", height: "100%" }}
      />
      {showEyes && (
        <div
          className="calcifer-eyes"
          style={{ bottom: eyeBottom, gap: eyeGap }}
        >
          <div
            className="calcifer-eye"
            style={{ width: eyeSize, height: eyeSize }}
          >
            <div
              className="calcifer-pupil"
              style={{ width: pupilSize, height: pupilSize }}
            />
          </div>
          <div
            className="calcifer-eye calcifer-eye--right"
            style={{ width: eyeSize, height: eyeSize }}
          >
            <div
              className="calcifer-pupil"
              style={{ width: pupilSize, height: pupilSize }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
