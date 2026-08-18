function CircuitGrid() {
  return (
    <>
      <path d="M0 30H240M0 60H240M0 90H240M40 0V120M80 0V120M120 0V120M160 0V120M200 0V120" className="calculator-thumbnail-grid" />
      <circle cx="22" cy="60" r="5" className="calculator-thumbnail-node" />
      <circle cx="218" cy="60" r="5" className="calculator-thumbnail-node" />
    </>
  );
}

function Diagram({ visualKey }) {
  switch (visualKey) {
    case "resistor":
      return <path d="M22 60h32l10-18 18 36 18-36 18 36 18-36 18 36 10-18h58" />;
    case "divider":
      return <path d="M30 28h80l10 12-20 14 20 14-20 14 10 10H30M110 92h100M160 92V60h50" />;
    case "led":
      return <><path d="M22 60h54l10-18 18 36 18-36 10 18h24M156 36v48M156 60h62" /><path d="m170 38 16-12m-7 24 17-12" /></>;
    case "battery":
      return <><path d="M22 60h54M90 34v52M110 45v30M110 60h108" /><path d="M84 24h12M90 18v12M104 24h12" /></>;
    case "capacitor":
      return <><path d="M22 60h78M100 34v52M124 34v52M124 60h94" /><path d="M160 82c14-32 32-32 48 0" /></>;
    case "wave":
      return <path d="M22 60h18c18 0 18-34 36-34s18 68 36 68 18-68 36-68 18 68 36 68 18-34 34-34" />;
    case "filter":
      return <><path d="M22 80h36l12-24 18 36 18-60 18 48 18-18h76" /><path d="M146 32v58h72" /></>;
    case "timer":
      return <><rect x="82" y="28" width="78" height="64" /><path d="M22 60h60M160 60h58M98 28V16M120 28V16M142 28V16M98 92v12M120 92v12M142 92v12" /><text x="121" y="68">555</text></>;
    case "number":
      return <><text x="25" y="70">0101</text><path d="M108 60h24" /><text x="142" y="70">0x5</text></>;
    case "conversion":
      return <><path d="M26 44h164l-18-16m18 16-18 16M214 78H50l18 16M50 78l18-16" /><text x="88" y="34">UNIT A</text><text x="98" y="96">UNIT B</text></>;
    case "physics":
      return <><circle cx="78" cy="68" r="24" /><path d="M102 68h92m0 0-18-14m18 14-18 14M78 44V22" /><text x="126" y="54">F = ma</text></>;
    case "ohms":
    default:
      return <><path d="M22 60h42l10-18 18 36 18-36 18 36 10-18h80" /><text x="90" y="28">V = IR</text></>;
  }
}

export function CalculatorThumbnail({ visualKey, title, compact = false }) {
  return (
    <div
      className={`calculator-thumbnail${compact ? " calculator-thumbnail--compact" : ""}`}
      role="img"
      aria-label={`${title} circuit diagram`}
    >
      <svg viewBox="0 0 240 120" aria-hidden="true" focusable="false">
        <CircuitGrid />
        <g className="calculator-thumbnail-diagram">
          <Diagram visualKey={visualKey} />
        </g>
      </svg>
    </div>
  );
}
