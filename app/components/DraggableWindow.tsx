"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from "react";

type Variant = "default" | "dark" | "fire";

export interface DraggableWindowProps {
  title: string;
  variant?: Variant;
  children: ReactNode;
  headerRight?: ReactNode;
  /** Desktop width in px. On mobile the window always fills the screen. */
  defaultWidth?: number;
  /** Called when the red (close) traffic-light button is pressed. */
  onClose?: () => void;
  /** Called when the yellow (minimize) traffic-light button is pressed. If provided, replaces internal minimize. */
  onMinimize?: () => void;
  className?: string;
  style?: CSSProperties;
  /** Where to render the title text. Default "center". "right" puts it in the right slot. */
  titleAlign?: "center" | "right";
  /** Base z-index for this window. Default 40. */
  zIndex?: number;
}

export function DraggableWindow({
  title,
  variant = "default",
  children,
  headerRight,
  defaultWidth = 560,
  onClose,
  onMinimize,
  className = "",
  style,
  titleAlign = "center",
  zIndex = 40,
}: DraggableWindowProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  // Snapshot actual window dimensions at drag-start for correct bounds on all 4 sides
  const dragBounds = useRef({ winW: defaultWidth, winH: 400 });
  const savedPos = useRef<{ x: number; y: number } | null>(null);

  /* ── Mount: detect mobile + compute centered position ── */
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    // One-time client-only init — intentional setState in effect (same pattern as page.tsx)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mobile);
    if (!mobile) {
      setPos({
        x: Math.max(0, Math.round((window.innerWidth - defaultWidth) / 2)),
        y: Math.max(32, Math.round((window.innerHeight - 520) / 4)),
      });
    }
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [defaultWidth]);

  /* ── Global mouse drag ── */
  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return;
      const { winW, winH } = dragBounds.current;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - winW, e.clientX - dragOffset.current.dx)),
        y: Math.max(0, Math.min(window.innerHeight - winH, e.clientY - dragOffset.current.dy)),
      });
    }
    function onUp() {
      dragging.current = false;
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  /* ── Global touch drag ── */
  useEffect(() => {
    function onMove(e: TouchEvent) {
      if (!dragging.current) return;
      const t = e.touches[0];
      const { winW, winH } = dragBounds.current;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - winW, t.clientX - dragOffset.current.dx)),
        y: Math.max(0, Math.min(window.innerHeight - winH, t.clientY - dragOffset.current.dy)),
      });
    }
    function onEnd() {
      dragging.current = false;
    }
    document.addEventListener("touchmove", onMove);
    document.addEventListener("touchend", onEnd);
    return () => {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (maximized || isMobile) return;
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      // Capture real rendered dimensions so right/bottom edges stay in bounds
      const rect = windowRef.current?.getBoundingClientRect();
      dragBounds.current = {
        winW: rect?.width ?? defaultWidth,
        winH: rect?.height ?? 400,
      };
      dragging.current = true;
      dragOffset.current = {
        dx: e.clientX - (pos?.x ?? 0),
        dy: e.clientY - (pos?.y ?? 0),
      };
    },
    [maximized, isMobile, pos, defaultWidth],
  );

  const handleTitleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (maximized || isMobile) return;
      if ((e.target as HTMLElement).closest("button")) return;
      const t = e.touches[0];
      const rect = windowRef.current?.getBoundingClientRect();
      dragBounds.current = {
        winW: rect?.width ?? defaultWidth,
        winH: rect?.height ?? 400,
      };
      dragging.current = true;
      dragOffset.current = {
        dx: t.clientX - (pos?.x ?? 0),
        dy: t.clientY - (pos?.y ?? 0),
      };
    },
    [maximized, isMobile, pos, defaultWidth],
  );

  function handleMinimize() {
    setMinimized((v) => !v);
    if (maximized) setMaximized(false);
  }

  function handleMaximize() {
    if (!maximized) {
      savedPos.current = pos;
      setMaximized(true);
      setMinimized(false);
    } else {
      setMaximized(false);
      if (savedPos.current) setPos(savedPos.current);
    }
  }

  const titlebarCls = [
    "retro-titlebar",
    variant === "dark" ? "retro-titlebar--dark" : "",
    variant === "fire" ? "retro-titlebar--fire" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /* ── Mobile: full-screen ── */
  if (isMobile) {
    return (
      <div className={`retro-window dw-mobile-window ${className}`}>
        <div className={titlebarCls}>
          <div className="traffic-lights">
            <button className="tl-btn tl-red" onClick={onClose} aria-label="Close" />
            <button
              className="tl-btn tl-yellow"
              onClick={onMinimize ?? handleMinimize}
              aria-label="Minimize"
            />
            <button className="tl-btn tl-green" aria-label="Fullscreen" />
          </div>
          {titleAlign === "center" && <span className="retro-title-text">{title}</span>}
          {titleAlign !== "center" && <span />}
          <div style={{ minWidth: 56, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {titleAlign === "right" && <span className="retro-title-text">{title}</span>}
            {headerRight ?? null}
          </div>
        </div>
        {!minimized && <div className="dw-content">{children}</div>}
      </div>
    );
  }

  /* ── Wait for client-side mount ── */
  if (pos === null) return null;

  // Maximized: flex column filling the full viewport so content stretches properly
  const windowStyle: CSSProperties = maximized
    ? {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        zIndex,
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: defaultWidth,
        zIndex,
        ...style,
      };

  // When maximized, content fills remaining viewport height via flex;
  // otherwise it's capped by the .dw-content max-height in CSS.
  const contentStyle: CSSProperties = maximized
    ? { flex: 1, minHeight: 0, overflowY: "auto", maxHeight: "none" }
    : {};

  return (
    <div ref={windowRef} className={`retro-window ${className}`} style={windowStyle}>
      {/* ── Title bar — drag handle ── */}
      <div
        className={`${titlebarCls} dw-titlebar`}
        style={{ cursor: maximized ? "default" : "grab" }}
        onMouseDown={handleTitleMouseDown}
        onTouchStart={handleTitleTouchStart}
      >
        <div className="traffic-lights">
          <button className="tl-btn tl-red" onClick={onClose} aria-label="Close" />
          <button
            className="tl-btn tl-yellow"
            onClick={handleMinimize}
            aria-label={minimized ? "Restore" : "Minimize"}
          />
          <button
            className="tl-btn tl-green"
            onClick={handleMaximize}
            aria-label={maximized ? "Restore" : "Maximize"}
          />
        </div>
        {titleAlign === "center" && <span className="retro-title-text">{title}</span>}
        {titleAlign !== "center" && <span />}
        <div style={{ minWidth: 56, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {titleAlign === "right" && <span className="retro-title-text">{title}</span>}
          {headerRight ?? null}
        </div>
      </div>

      {/* ── Content ── */}
      {!minimized && (
        <div className="dw-content" style={contentStyle}>
          {children}
        </div>
      )}
    </div>
  );
}
