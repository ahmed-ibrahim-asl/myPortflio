import { DiagramFrame, GroundSymbol, NodeDot, ResistorH, Wire } from "./Symbols";

export function OpAmpGainDiagram() {
  return (
    <DiagramFrame
      viewBox="0 -16 300 216"
      height={200}
      caption="Inverting configuration shown — Rin sets the input path, Rf sets the feedback path"
    >
      <text x={8} y={64} className="diagram-label">
        Vin
      </text>
      <Wire x1={32} y1={60} x2={70} y2={60} />
      <ResistorH x={70} y={60} width={60} label="Rin" />
      <Wire x1={130} y1={60} x2={160} y2={60} />
      <NodeDot x={160} y={60} />

      <polygon points="160,30 160,110 230,70" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <text x={170} y={48} className="diagram-label">
        −
      </text>
      <text x={170} y={98} className="diagram-label">
        +
      </text>
      <Wire x1={160} y1={100} x2={140} y2={100} />
      <Wire x1={140} y1={100} x2={140} y2={130} />
      <GroundSymbol x={140} y={130} />

      <Wire x1={230} y1={70} x2={260} y2={70} />
      <text x={264} y={74} className="diagram-label">
        Vout
      </text>

      <Wire x1={160} y1={60} x2={160} y2={20} />
      <Wire x1={160} y1={20} x2={185} y2={20} />
      <ResistorH x={185} y={20} width={60} label="Rf" />
      <Wire x1={245} y1={20} x2={245} y2={70} />
      <NodeDot x={245} y={70} />
    </DiagramFrame>
  );
}

