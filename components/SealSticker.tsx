import React from "react";
import {QRCodeSVG} from "qrcode.react";

export type SealStickerProps = {
  /** 要编码到二维码的文本 */
  qrValue?: string;
  /** 两行序列号，例如 ['0000 1709', '5419 1989'] */
  serialLines?: [string, string];
  /** 中间的短码，例如 '4G3YG' */
  badge?: string;
  /** 底部域名 */
  domain?: string;
  /** SVG 宽度（mm） */
  widthMm?: number; // default 40
  /** SVG 高度（mm） */
  heightMm?: number; // default 60
};

/**
 * SealSticker
 * 一个单文件 React 组件，输出一个 40mm x 60mm 的封箱贴（SVG）。
 * 使用 qrcode.react 生成内嵌 SVG 格式二维码。
 * 直接把这个组件放到页面即可渲染并打印（SVG 使用 mm 单位，能得到真实世界尺寸）。
 */
export default function SealSticker({
                                      qrValue = "https://seal.alex3236.moe/s/1267126712671267",
                                      serialLines = ["0000 1709", "5419 1989"],
                                      badge = "4G3YG",
                                      domain = "Alex3236.moe",
                                      widthMm = 40,
                                      heightMm = 60,
                                    }: SealStickerProps) {
  // 我们使用一个定长的 viewBox（单位 px），并用 mm 指定最终渲染尺寸，这样坐标计算方便。
  const vw = 400; // viewBox width
  const vh = 600; // viewBox height

  // 布局常量（基于 vw/vh）
  const qrBoxW = 260; // 内部圆角矩形区域尺寸
  const qrBoxH = 320;
  const qrBoxX = (vw - qrBoxW) / 2;
  const qrBoxY = 70;
  const qrSize = 200; // 二维码实际像素尺寸

  return (
    <div className="inline-block p-2 bg-white text-black font-sans">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${widthMm}mm`}
        height={`${heightMm}mm`}
        viewBox={`0 0 ${vw} ${vh}`}
        role="img"
        aria-label="封箱贴"
      >
        {/* 顶部标题：封箱贴 */}
        <text
          x={vw / 2}
          y={40}
          textAnchor="middle"
          fontSize={48}
          className="font-medium"
        >
          封箱贴
        </text>

        {/* 中间带圆角的二维码框 */}
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

        {/* 二维码（嵌入到 SVG。qrcode.react 输出一个 <svg>，我们用 foreignObject 包裹更稳妥） */}
        <foreignObject
          x={qrBoxX + (qrBoxW - qrSize) / 2}
          y={qrBoxY + 24}
          width={qrSize}
          height={qrSize}
        >
          {/* qrcode.react 输出 svg 元素；为了让其能在 foreignObject 中正确渲染，必须在 DOM 环境下使用。 */}
          <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <QRCodeSVG value={qrValue} size={qrSize}/>
          </div>
        </foreignObject>

        {/* 二维码下方的两行序列号 */}
        <text
          x={vw / 2}
          y={qrBoxY + qrSize + 62}
          textAnchor="middle"
          fontSize={32}
          className="font-bold"
        >
          {serialLines[0]}
        </text>
        <text
          x={vw / 2}
          y={qrBoxY + qrSize + 99}
          textAnchor="middle"
          fontSize={32}
          className="font-bold"
        >
          {serialLines[1]}
        </text>

        {/* 中间的短码 badge（椭圆带边框） */}
        <g transform={`translate(${vw / 2}, ${qrBoxY + qrSize + 164})`}>
          <rect x={-80} y={-30} width={160} height={51} rx={26} ry={26} fill="none" stroke="#000" strokeWidth={4}/>
          <text x={0} y={10} textAnchor="middle" fontSize={36} className="font-extrabold">
            {badge}
          </text>
        </g>

        {/* 扫码提示文案 */}
        <text x={vw / 2} y={qrBoxY + qrSize + 230} textAnchor="middle" fontSize={32} className="font-medium">
          扫码查询封箱信息
        </text>

        {/* 底部域名 */}
        <text x={vw / 2} y={vh - 20} textAnchor="middle" fontSize={50} className="font-extrabold">
          {domain}
        </text>
      </svg>
    </div>
  );
}
