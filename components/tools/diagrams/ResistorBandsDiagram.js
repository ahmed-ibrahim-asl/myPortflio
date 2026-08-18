export function ResistorBandsDiagram({ bands }) {
  const bodyX = 40;
  const bodyY = 30;
  const bodyW = 220;
  const bodyH = 50;
  const bandWidth = 12;
  const spacing = 17;
  const leftBands = bands.slice(0, -1);
  const toleranceHex = bands[bands.length - 1];
  const startX = bodyX + 36;
  const toleranceX = bodyX + bodyW - 28;

  return (
    <div className="resistor-preview">
      <svg viewBox="0 0 300 110" role="img" aria-label="Resistor with the selected color bands">
        <line x1={0} y1={55} x2={bodyX} y2={55} stroke="var(--ink)" strokeWidth="3" />
        <line x1={bodyX + bodyW} y1={55} x2={300} y2={55} stroke="var(--ink)" strokeWidth="3" />
        <rect
          x={bodyX}
          y={bodyY}
          width={bodyW}
          height={bodyH}
          rx={bodyH / 2}
          fill="#e3d4ad"
          stroke="var(--ink)"
          strokeWidth="2"
        />
        {leftBands.map((hex, index) => (
          <rect
            key={index}
            x={startX + index * spacing - bandWidth / 2}
            y={bodyY - 1}
            width={bandWidth}
            height={bodyH + 2}
            fill={hex === "transparent" ? "none" : hex}
            stroke={hex === "transparent" ? "var(--line)" : "rgba(0,0,0,0.2)"}
          />
        ))}
        <rect
          x={toleranceX - bandWidth / 2}
          y={bodyY - 1}
          width={bandWidth}
          height={bodyH + 2}
          fill={toleranceHex === "transparent" ? "none" : toleranceHex}
          stroke={toleranceHex === "transparent" ? "var(--line)" : "rgba(0,0,0,0.2)"}
        />
      </svg>
    </div>
  );
}
