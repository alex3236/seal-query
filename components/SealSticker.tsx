import React from "react";
import { QRCodeSVG } from "qrcode.react";

export type SealStickerProps = {
  /** Text to encode in QR code */
  qrValue: string;
  /** Two lines of serial numbers, e.g. ['0000 1709', '5419 1989'] */
  serialLines: [string, string];
  /** Short code in the middle, e.g. '4G3YG' */
  badge: string;
};

/**
 * SealSticker
 * A single-file React component that outputs a 40mm x 60mm seal sticker (SVG).
 * Uses qrcode.react to generate embedded SVG format QR code.
 * Simply place this component on the page to render and print (SVG uses mm units for real-world dimensions).
 */
export default function SealSticker({
  qrValue,
  serialLines,
  badge,
}: SealStickerProps) {
  // We use a fixed-length viewBox (in px) and specify final rendering size in mm for convenient coordinate calculation.
  const widthMm = 40, heightMm = 60;
  const vw = 400, vh = 600;

  // Layout constants (based on vw/vh)
  const qrBoxW = 260; // Inner rounded rectangle area size
  const qrBoxH = 320;
  const qrBoxX = (vw - qrBoxW) / 2;
  const qrBoxY = 70;
  const qrSize = 200; // Actual QR code pixel size

  return (
    <div className="inline-block p-2 bg-white text-black font-sans">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${widthMm}mm`}
        height={`${heightMm}mm`}
        viewBox={`0 0 ${vw} ${vh}`}
        role="img"
        aria-label="Sticker"
      >
        {/* Top title: Seal Sticker */}
        <text
          x={vw / 2}
          y={40}
          textAnchor="middle"
          fontSize={48}
          className="font-medium"
        >
          Seal Sticker
        </text>

        {/* QR code box with rounded corners in the middle */}
        <rect
          x={qrBoxX}
          y={qrBoxY}
          width={qrBoxW}
          height={qrBoxH}
          rx={28}
          ry={28}
          fill="none"
          stroke="#000"
          strokeWidth={8}
        />

        {/* QR code (embedded in SVG. qrcode.react outputs a <svg>, we wrap it with foreignObject for better compatibility) */}
        <foreignObject
          x={qrBoxX + (qrBoxW - qrSize) / 2}
          y={qrBoxY + 24}
          width={qrSize}
          height={qrSize}
        >
          {/* qrcode.react outputs svg element; to render correctly in foreignObject, it must be used in a DOM environment. */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <QRCodeSVG value={qrValue} size={qrSize} />
          </div>
        </foreignObject>

        {/* Two lines of serial numbers below QR code */}
        {
          serialLines.map((line, idx) => (
            <text
              key={idx}
              x={vw / 2}
              y={qrBoxY + qrSize + 62 + idx * 36}
              textAnchor="middle"
              fontSize={36}
              className="font-bold font-mono"
            >
              {line}
            </text>
          ))
        }

        {/* Short code badge in the middle (ellipse with border) */}
        <g transform={`translate(${vw / 2}, ${qrBoxY + qrSize + 164})`}>
          <rect x={-80} y={-30} width={160} height={51} rx={26} ry={26} fill="none" stroke="#000" strokeWidth={4} />
          <text x={0} y={10} textAnchor="middle" fontSize={36} className="font-extrabold">
            {badge}
          </text>
        </g>

        {/* Scan to query prompt text */}
        <text x={vw / 2} y={qrBoxY + qrSize + 230} textAnchor="middle" fontSize={32} className="font-medium">
          Scan to query seal information
        </text>

        {/* Bottom Logo, centered */}
        <image
          href="/logo.svg"
          y={vh - 60}
          width={vw}
          height={40}
        />
      </svg>
    </div>
  );
}
