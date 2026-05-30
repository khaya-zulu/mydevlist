"use client";

import { useRef, useEffect } from "react";

import createGlobe from "cobe";

import { polaroidMarkers } from "@/app/data/polaroids";

// Displayed (CSS) size of the square globe.
const SIZE = 620;

// Globe orientation — must match the values passed to createGlobe below so the
// overlay projection lines up with what's rendered.
const THETA = 0.3;
const MARKER_ELEVATION = 0;

const DEG2RAD = Math.PI / 180;

// Reimplements cobe's internal marker projection (lat/long -> rotated 3D ->
// orthographic screen space) so we can position HTML overlays on top of the
// canvas. Derived from cobe's marker vertex shader: with scale=1 and
// offset=[0,0] on a square canvas, clip-space x/y map directly to the marker.
function project(location: [number, number], phi: number, theta: number) {
  const [lat, long] = location;
  const latRad = lat * DEG2RAD;
  const lngRad = long * DEG2RAD - Math.PI;
  const cosLat = Math.cos(latRad);

  // Base unit-sphere position (cobe's `U` function).
  const px = -cosLat * Math.cos(lngRad);
  const py = Math.sin(latRad);
  const pz = cosLat * Math.sin(lngRad);

  // Lift to the marker's rendered radius.
  const r = 0.8 + MARKER_ELEVATION;
  const ax = px * r;
  const ay = py * r;
  const az = pz * r;

  // Rotate by phi (around Y) and theta (tilt), matching the shader.
  const c = Math.cos(theta);
  const d = Math.sin(theta);
  const e = Math.cos(phi);
  const f = Math.sin(phi);
  const lx = e * ax + f * az;
  const ly = f * d * ax + c * ay - e * d * az;
  const lz = -f * c * ax + d * ay + e * c * az;

  // Clip space [-1, 1] -> CSS pixels (Y flipped). Square canvas => aspect = 1.
  const screenX = (lx * 0.5 + 0.5) * SIZE;
  const screenY = (0.5 - ly * 0.5) * SIZE;

  return { x: screenX, y: screenY, depth: lz };
}

export const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // One DOM ref per polaroid so we can move it in the render loop without
  // triggering React re-renders.
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth < 640 ? 1.8 : 2,
    );

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: SIZE,
      height: SIZE,
      phi: 0,
      theta: THETA,
      dark: 1,
      diffuse: 0.4,
      scale: 1,
      mapSamples: 16000,
      mapBrightness: 12,
      baseColor: [0.08, 0.08, 0.08],
      markerColor: [1, 0.35, 0.65],
      glowColor: [0, 0, 0],
      offset: [0, 0],
      markerElevation: MARKER_ELEVATION,
      markers: polaroidMarkers.map((m) => ({
        location: m.location,
        size: m.size,
      })),
      opacity: 0.9,
    });

    // Drag-to-rotate state. While the pointer is held down we stop the
    // auto-rotation and drive `phi` directly from the horizontal drag.
    let dragging = false;
    let lastX = 0;
    const DRAG_SPEED = 0.005; // radians of rotation per pixel dragged

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      phi += (e.clientX - lastX) * DRAG_SPEED;
      lastX = e.clientX;
    };
    const endDrag = () => {
      dragging = false;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    let animationId: number;
    function animate() {
      // Auto-rotate only when the user isn't dragging.
      if (!dragging) phi += 0.003;
      globe.update({ phi });

      for (const m of polaroidMarkers) {
        const el = itemRefs.current[m.id];
        if (!el) continue;
        const { x, y, depth } = project(m.location, phi, THETA);
        // Fade out as the marker rotates to the far side of the globe.
        const opacity = Math.max(0, Math.min(1, depth * 4));
        el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(var(--polaroid-rotate))`;
        el.style.opacity = String(opacity);
        el.style.filter = `blur(${(1 - opacity) * 6}px)`;
        el.style.zIndex = String(Math.round(depth * 100) + 100);
      }

      animationId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      if (globe && typeof (globe as any).destroy === "function") {
        (globe as any).destroy();
      }
    };
  }, []);

  return (
    <div
      className="relative z-10 translate-y-56"
      style={{ width: SIZE, height: SIZE }}
    >
      <canvas
        id="cobe"
        ref={canvasRef}
        style={{
          width: SIZE,
          height: SIZE,
          cursor: "grab",
          // Prevent touch-drag from scrolling the page on mobile.
          touchAction: "none",
        }}
      />
      {polaroidMarkers.map((m) => (
        <div
          key={m.id}
          ref={(el) => {
            itemRefs.current[m.id] = el;
          }}
          className="showcase-polaroid"
          style={
            {
              "--polaroid-rotate": `${m.rotate}deg`,
            } as React.CSSProperties
          }
        >
          <img src={m.image} alt={m.caption} />
          <span className="showcase-polaroid-caption">{m.caption}</span>
        </div>
      ))}
    </div>
  );
};
