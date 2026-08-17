import React from "react";

export function PixelWorld() {
  return (
    <div className="pixel-world" aria-hidden="true">
      <svg viewBox="0 0 960 420" role="presentation" shapeRendering="crispEdges">
        <rect className="pixel-sky" width="960" height="420" />
        <g className="pixel-stars">
          <rect x="64" y="38" width="8" height="8" />
          <rect x="156" y="78" width="6" height="6" />
          <rect x="742" y="42" width="8" height="8" />
          <rect x="852" y="92" width="6" height="6" />
        </g>
        <g className="pixel-clouds">
          <rect x="96" y="74" width="168" height="14" />
          <rect x="126" y="60" width="92" height="14" />
          <rect x="660" y="86" width="194" height="14" />
          <rect x="700" y="72" width="114" height="14" />
        </g>
        <g className="pixel-city-back">
          <rect x="0" y="180" width="110" height="200" />
          <rect x="126" y="222" width="112" height="158" />
          <rect x="254" y="154" width="144" height="226" />
          <rect x="414" y="206" width="118" height="174" />
          <rect x="548" y="136" width="164" height="244" />
          <rect x="728" y="196" width="104" height="184" />
          <rect x="848" y="164" width="112" height="216" />
        </g>
        <g className="pixel-windows">
          {[
            [24, 214], [58, 214], [24, 248], [58, 282], [148, 248],
            [188, 248], [278, 188], [320, 188], [362, 222], [438, 238],
            [474, 238], [578, 172], [620, 172], [662, 206], [752, 228],
            [786, 262], [874, 198], [914, 232]
          ].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="16" height="10" />)}
        </g>
        <g className="pixel-platforms">
          <rect x="0" y="350" width="244" height="18" />
          <rect x="98" y="330" width="188" height="12" />
          <rect x="336" y="310" width="246" height="20" />
          <rect x="382" y="288" width="154" height="12" />
          <rect x="670" y="338" width="290" height="20" />
          <rect x="730" y="316" width="170" height="12" />
        </g>
        <g className="pixel-circuit">
          <path d="M38 144H210V112H350V132H506" />
          <path d="M506 132H690V104H922" />
          <rect x="202" y="104" width="16" height="16" />
          <rect x="498" y="124" width="16" height="16" />
          <rect x="682" y="96" width="16" height="16" />
        </g>
        <g className="pixel-antenna">
          <rect x="810" y="154" width="12" height="184" />
          <rect x="786" y="150" width="60" height="12" />
          <rect x="796" y="122" width="40" height="28" />
          <rect x="804" y="110" width="24" height="12" />
        </g>
        <g className="pixel-bot">
          <rect x="146" y="288" width="52" height="42" />
          <rect x="154" y="276" width="36" height="12" />
          <rect x="138" y="298" width="8" height="20" />
          <rect x="198" y="298" width="8" height="20" />
          <rect x="154" y="330" width="10" height="18" />
          <rect x="180" y="330" width="10" height="18" />
          <rect className="pixel-bot-eye" x="158" y="296" width="8" height="8" />
          <rect className="pixel-bot-eye" x="178" y="296" width="8" height="8" />
        </g>
      </svg>
      <span className="pixel-world-label">WORLD_01 / ENGINEERING DISTRICT</span>
    </div>
  );
}
