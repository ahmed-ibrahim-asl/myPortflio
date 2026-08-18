import { CapacitorV, DiagramFrame, GroundSymbol, NodeDot, ResistorH, Wire } from "./Symbols";

export function Timer555AstableDiagram() {
  return (
    <DiagramFrame
      viewBox="0 0 300 200"
      height={200}
      caption="R1 and R2 charge C; the 555 flips its output as C crosses each threshold"
    >
      <text x={20} y={20} className="diagram-label">
        Vcc
      </text>
      <Wire x1={20} y1={26} x2={20} y2={50} />
      <Wire x1={20} y1={50} x2={50} y2={50} />
      <ResistorH x={50} y={50} width={60} label="R1" />
      <Wire x1={110} y1={50} x2={140} y2={50} />
      <NodeDot x={140} y={50} />
      <Wire x1={140} y1={50} x2={170} y2={50} />
      <ResistorH x={170} y={50} width={60} label="R2" />
      <Wire x1={230} y1={50} x2={260} y2={50} />
      <NodeDot x={260} y={50} />
      <Wire x1={260} y1={50} x2={260} y2={90} />
      <CapacitorV x={260} y={90} label="C" />
      <Wire x1={260} y1={160} x2={260} y2={175} />
      <GroundSymbol x={260} y={175} />

      <rect
        x={105}
        y={110}
        width={70}
        height={50}
        rx={4}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <text x={140} y={140} textAnchor="middle" className="diagram-label-bold">
        555
      </text>
      <Wire x1={140} y1={50} x2={140} y2={110} />
      <Wire x1={175} y1={135} x2={205} y2={135} />
      <polyline
        points="205,135 205,120 220,120 220,150 235,150 235,120"
        fill="none"
        stroke="var(--signal-dark)"
        strokeWidth="2"
      />
    </DiagramFrame>
  );
}
