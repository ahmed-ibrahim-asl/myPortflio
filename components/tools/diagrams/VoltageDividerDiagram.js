import { DiagramFrame, GroundSymbol, NodeDot, ResistorV, Wire } from "./Symbols";

export function VoltageDividerDiagram() {
  return (
    <DiagramFrame
      viewBox="0 0 240 220"
      height={220}
      caption="R1 and R2 in series — the tap between them is Vout"
    >
      <text x={60} y={16} textAnchor="middle" className="diagram-label">
        Vin
      </text>
      <Wire x1={60} y1={22} x2={60} y2={46} />
      <ResistorV x={60} y={46} height={60} label="R1" />
      <NodeDot x={60} y={106} />
      <Wire x1={60} y1={106} x2={170} y2={106} />
      <text x={180} y={110} className="diagram-label">
        Vout
      </text>
      <ResistorV x={60} y={106} height={60} label="R2" />
      <Wire x1={60} y1={166} x2={60} y2={186} />
      <GroundSymbol x={60} y={186} />
    </DiagramFrame>
  );
}

