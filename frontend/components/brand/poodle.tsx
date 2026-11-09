"use client";

import { useId } from "react";

/**
 * Identidad de marca: el caniche ES el logo. Poodle macho de corte continental,
 * ojos lavanda y collar LED con chapa de rayo. Sin visores ni gadgets.
 */
function PoodleArt() {
  return (
    <g>
      <g fill="#c7ccfd" className="ear-l">
        <circle cx="31" cy="48" r="12" />
        <circle cx="27" cy="62" r="12.5" />
        <circle cx="25" cy="77" r="12.5" />
        <circle cx="28" cy="91" r="11" />
      </g>
      <g fill="#c7ccfd" className="ear-r">
        <circle cx="89" cy="48" r="12" />
        <circle cx="93" cy="62" r="12.5" />
        <circle cx="95" cy="77" r="12.5" />
        <circle cx="92" cy="91" r="11" />
      </g>
      <g fill="none" stroke="#a3a9ee" strokeWidth="1.4" strokeLinecap="round">
        <path d="M22 70 q5 3 9 -1 M21 84 q6 3 10 -2 M24 56 q5 3 8 -1" />
        <path d="M98 70 q-5 3 -9 -1 M99 84 q-6 3 -10 -2 M96 56 q-5 3 -8 -1" />
      </g>
      <ellipse cx="60" cy="92" rx="22" ry="11" fill="#eceeff" />
      <g fill="#dde0ff">
        <circle cx="34" cy="104" r="8" />
        <circle cx="86" cy="104" r="8" />
        <circle cx="45" cy="106" r="10" />
        <circle cx="75" cy="106" r="10" />
        <circle cx="60" cy="109" r="11" />
      </g>
      <g fill="#cfd3ff">
        <circle cx="78" cy="26" r="9" />
        <circle cx="68" cy="14" r="11" />
      </g>
      <g fill="#eceeff">
        <circle cx="58" cy="13" r="12" />
        <circle cx="45" cy="22" r="10" />
        <circle cx="60" cy="27" r="11" />
        <circle cx="72" cy="22" r="10" />
      </g>
      <path
        d="M36 50 C36 33 47 27 60 27 C73 27 84 33 84 50 L84 66 C84 80 74 88 60 88 C46 88 36 80 36 66Z"
        fill="#eceeff"
      />
      <rect x="44" y="63" width="32" height="32" rx="13" fill="#f7f8ff" />
      <path d="M51 70 h18 q2.5 0 1.8 3 q-3.5 7 -10.8 7 q-7.3 0 -10.8 -7 q-.7 -3 1.8 -3z" fill="#010102" />
      <ellipse cx="56" cy="72.2" rx="3" ry="1.1" fill="#fff" opacity=".35" />
      <path
        d="M60 79.5 v4.5 M60 84 q-6 5.5 -11.5 -.5 M60 84 q6.5 5 11.5 -2"
        fill="none"
        stroke="#010102"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <g fill="#a3a9ee">
        <circle cx="52" cy="88" r="1" />
        <circle cx="55.5" cy="90" r="1" />
        <circle cx="68" cy="88" r="1" />
        <circle cx="64.5" cy="90" r="1" />
      </g>
      <g stroke="#8d95e6" strokeWidth="3.2" strokeLinecap="round">
        <path d="M40 49 L54 51" />
        <path d="M80 49 L66 51" />
      </g>
      <g className="eyes" style={{ transformOrigin: "60px 58px" }}>
        <circle cx="47" cy="58" r="4.6" fill="#828fff" />
        <circle cx="73" cy="58" r="4.6" fill="#828fff" />
        <circle cx="47" cy="58" r="2.6" fill="#010102" />
        <circle cx="73" cy="58" r="2.6" fill="#010102" />
        <circle cx="48.2" cy="56.8" r="1.1" fill="#fff" />
        <circle cx="74.2" cy="56.8" r="1.1" fill="#fff" />
      </g>
      <path d="M37 94 Q60 108 83 94" fill="none" stroke="#2a2d6b" strokeWidth="7" strokeLinecap="round" />
      <path className="led" d="M37 94 Q60 108 83 94" fill="none" stroke="#828fff" strokeWidth="2" strokeLinecap="round" />
      <circle className="tag-ring" cx="60" cy="103" r="8" fill="none" stroke="#828fff" strokeWidth="1.4" />
      <circle cx="60" cy="103" r="8" fill="#010102" stroke="#828fff" strokeWidth="1.6" />
      <path className="bolt-g" d="M61.5 97.5 55.5 104.5 h4.2 l-1.2 5 6.2 -7.2 h-4.3z" fill="#d8dcff" />
    </g>
  );
}

export function Matias({ size = 44, thinking = false }: { size?: number; thinking?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-label="MATIAS"
      role="img"
      className={`volty-anim overflow-visible ${thinking ? "volty-think" : ""}`}
    >
      <PoodleArt />
    </svg>
  );
}

export function VoltyMark({ size = 32, clipId }: { size?: number; clipId?: string }) {
  const raw = useId().replace(/:/g, "");
  const id = clipId ?? `vm-clip-${raw}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="volty-anim overflow-visible"
    >
      <defs>
        <clipPath id={id}>
          <rect x="2" y="2" width="116" height="116" rx="30" />
        </clipPath>
      </defs>
      <rect x="2" y="2" width="116" height="116" rx="30" fill="#0f1011" stroke="#34343a" strokeWidth="3" />
      <g clipPath={`url(#${id})`}>
        <g transform="translate(8 5) scale(.87)">
          <PoodleArt />
        </g>
      </g>
    </svg>
  );
}
