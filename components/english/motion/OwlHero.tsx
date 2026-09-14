"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "./useReducedMotion";

const EYE_R =
  "M528.355 456.998C520.471 449.742 506.551 446.137 498.818 456.068C495.794 459.952 493.376 465.08 492.643 470.29C487.05 478.419 483.596 487.78 488.654 496.507C495.073 507.578 508.761 505.892 516.901 498.217C523.058 492.414 527.204 484.39 530.931 476.924C534.146 470.459 534.03 462.214 528.355 456.998Z";
const EYE_L =
  "M301.117 456.475C287.342 454.65 271.969 456.318 266.695 471.343C266.533 471.808 266.457 472.296 266.335 472.767C259.91 479.483 259.869 488.768 261.317 497.606C262.335 503.822 269.998 509.607 276.237 508.968C277.022 508.886 277.813 508.84 278.603 508.782C279.144 508.968 279.662 509.287 280.214 509.369C283.546 509.834 285.185 510.218 288.523 509.369C289.877 509.026 291.034 508.375 292.162 507.706C296.622 507.002 300.861 505.63 304.535 502.496C307.704 499.787 309.17 495.612 310.548 491.85C311.106 490.327 311.676 488.809 312.274 487.303C312.373 487.071 312.588 486.53 312.792 486.047C313.548 484.344 314.356 482.652 315.17 480.983C321.089 468.959 313.6 458.132 301.117 456.475Z";
const SMILE =
  "M508.877 568.727C505.534 558.337 494.486 556.697 486.55 562.831C475.595 571.291 472.473 585.281 463.1 595.624C450.849 609.131 433.028 615.957 415.76 620.056C376.274 629.435 341.376 609.341 325.032 573.861C318.427 559.534 297.704 570.093 300.739 584.1C312.165 636.86 362.93 660.269 413.358 655.047C448.907 651.367 523.861 615.242 508.877 568.727Z";
const BODY =
  "M740.371 479.785C732.114 468.709 720.009 464.179 707.06 462.15C713.724 423.635 714.369 384.441 708.06 347.042C679.285 176.407 509.609 46.5953 336.864 68.3934C150.89 91.8545 70.803 283.049 90.9673 454.271C70.2855 458.254 53.9064 473.127 53.0284 496.147C52.1679 518.84 70.989 539.545 93.9443 538.731C98.5551 538.568 104.201 537.656 108.678 535.225C147.181 652.298 238.973 742.34 381.972 731.507C389.496 730.938 396.915 729.792 404.282 728.373C407.078 731.996 411.364 734.577 417.219 734.804C543.792 739.746 640.602 650.495 685.285 538.888C706.927 542.947 732.731 534.946 742.598 514.189C747.825 503.205 747.848 489.815 740.371 479.785ZM228.507 265.99C228.379 265.99 228.251 265.978 228.123 265.978C227.995 265.949 227.943 265.949 227.786 265.914C226.896 265.711 225.96 265.606 225.024 265.513C234.344 262.565 243.572 259.35 252.823 256.274C244.898 259.902 236.775 263.094 228.507 265.99ZM429.097 699.999C425.551 695.586 419.905 692.627 412.939 693.58C338.213 703.802 269.027 693.388 211.866 641.076C163.083 596.433 138.314 531.039 126.807 467.435C120.249 431.177 119.359 393.139 124.063 355.828C156.833 369.451 211.203 361.526 243.961 363.323C302.437 366.526 360.703 369.916 419.283 369.91C479.619 369.899 539.96 369.765 600.296 369.893C617.245 369.934 658.958 367.875 676.913 370.381C693.129 521.393 588.389 697.592 429.097 699.999Z";

/**
 * Big mascot panel: the owl's eyes follow the cursor, blink every few
 * seconds, and drift gently when idle (touch devices). All transform-only.
 */
export function OwlHero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reduceMotion || !ref.current) return;
      const ctx = gsap.context(() => {
        // Gentle whole-mascot bob.
        gsap.to("[data-owl-bob]", {
          y: -10,
          duration: 2.8,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        // Slow idle drift underneath cursor tracking (parent group).
        gsap.to(".owl-drift", {
          x: 7,
          duration: 3.1,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
        // Cursor tracking per eye.
        const eyes = gsap.utils.toArray<SVGGElement>(".owl-eye");
        const setters = eyes.map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }),
        }));
        const zone = ref.current as HTMLElement;
        const onMove = (e: PointerEvent) => {
          const r = zone.getBoundingClientRect();
          const nx = (e.clientX - (r.left + r.width / 2)) / r.width;
          const ny = (e.clientY - (r.top + r.height / 2)) / r.height;
          setters.forEach((s) => {
            s.x(gsap.utils.clamp(-11, 11, nx * 30));
            s.y(gsap.utils.clamp(-8, 8, ny * 24));
          });
        };
        zone.addEventListener("pointermove", onMove);
        // Random-interval blinking.
        let alive = true;
        const blink = () => {
          if (!alive) return;
          gsap.to(eyes, {
            scaleY: 0.08,
            duration: 0.07,
            yoyo: true,
            repeat: 1,
            transformOrigin: "50% 50%",
            onComplete: () => {
              gsap.delayedCall(2.4 + Math.random() * 3.6, blink);
            },
          });
        };
        gsap.delayedCall(1.6, blink);
        return () => {
          alive = false;
          zone.removeEventListener("pointermove", onMove);
        };
      }, ref);
      return () => ctx.revert();
    },
    { scope: ref, dependencies: [reduceMotion] },
  );

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[300px] md:max-w-[360px]"
      role="img"
      aria-label="بومة المنصة تنظر إليك"
    >
      {/* Faithful to public/logo.svg: all-white artwork on the navy
          backdrop. Eyes use the backdrop color so they read as cutouts
          (negative space) exactly like the original mark. */}
      <div className="rounded-2xl p-6" style={{ background: "#0a1530" }}>
        <svg viewBox="0 0 800 800" className="h-auto w-full" aria-hidden="true">
          <g data-owl-bob>
            <path d={BODY} fill="white" />
            <g className="owl-drift">
              <g
                className="owl-eye"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <path d={EYE_R} fill="#0a1530" />
              </g>
              <g
                className="owl-eye"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <path d={EYE_L} fill="#0a1530" />
              </g>
            </g>
            <path d={SMILE} fill="white" />
          </g>
        </svg>
      </div>
    </div>
  );
}
