import { CapacitorV, DiagramFrame, GroundSymbol, NodeDot, ResistorH, Wire } from "./Symbols";

export function Timer555MonostableDiagram() {
  return (
    <DiagramFrame
      viewBox="0 0 300 200"
      height={200}
      caption="Trigger starts the timer; R and C set how long the single output pulse lasts"
    >
      <text x={20} y={20} className="diagram-label">
        Vcc
      </text>
      <Wire x1={20} y1={26} x2={20} y2={50} />
      <Wire x1={20} y1={50} x2={50} y2={50} />
      <ResistorH x={50} y={50} width={60} label="R" />
      <Wire x1={110} y1={50} x2={140} y2={50} />
      <NodeDot x={140} y={50} />
      <Wire x1={140} y1={50} x2={140} y2={90} />
      <CapacitorV x={140} y={90} label="C" />
      <Wire x1={140} y1={160} x2={140} y2={175} />
      <GroundSymbol x={140} y={175} />

      <Wire x1={140} y1={50} x2={165} y2={50} />
      <rect
        x={165}
        y={95}
        width={70}
        height={50}
        rx={4}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <text x={200} y={125} textAnchor="middle" className="diagram-label-bold">
        555
      </text>
      <Wire x1={165} y1={50} x2={165} y2={95} />
      <Wire x1={235} y1={120} x2={260} y2={120} />
      <polyline
        points="260,120 268,120 268,95 285,95 285,120"
        fill="none"
        stroke="var(--signal-dark)"
        strokeWidth="2"
      />
    </DiagramFrame>
  );
}
