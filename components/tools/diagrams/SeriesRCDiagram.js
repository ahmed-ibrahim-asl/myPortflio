import { CapacitorH, CapacitorV, DiagramFrame, GroundSymbol, NodeDot, ResistorH, ResistorV, Wire } from "./Symbols";

export function SeriesRCDiagram({ first, firstLabel, second, secondLabel, caption }) {
  const startX = 20;
  const y = 55;
  const firstWidth = first === "resistor" ? 70 : 60;
  const nodeX = startX + 30 + firstWidth + 20;
  const secondHeight = second === "resistor" ? 70 : 50;
  const legY = y + 20;

  return (
    <DiagramFrame viewBox="0 0 260 210" height={210} caption={caption}>
      <text x={startX} y={y - 16} className="diagram-label">
        Vin
      </text>
      <Wire x1={startX} y1={y} x2={startX + 30} y2={y} />
      {first === "resistor" ? (
        <ResistorH x={startX + 30} y={y} width={firstWidth} label={firstLabel} />
      ) : (
        <CapacitorH x={startX + 30} y={y} label={firstLabel} />
      )}
      <Wire x1={startX + 30 + firstWidth} y1={y} x2={nodeX} y2={y} />
      <NodeDot x={nodeX} y={y} />
      <Wire x1={nodeX} y1={y} x2={nodeX + 45} y2={y} />
      <text x={nodeX + 50} y={y + 4} className="diagram-label">
        Vout
      </text>
      <Wire x1={nodeX} y1={y} x2={nodeX} y2={legY} />
      {second === "resistor" ? (
        <ResistorV x={nodeX} y={legY} height={secondHeight} label={secondLabel} />
      ) : (
        <CapacitorV x={nodeX} y={legY} label={secondLabel} />
      )}
      <Wire x1={nodeX} y1={legY + secondHeight} x2={nodeX} y2={legY + secondHeight + 20} />
      <GroundSymbol x={nodeX} y={legY + secondHeight + 20} />
    </DiagramFrame>
  );
}

