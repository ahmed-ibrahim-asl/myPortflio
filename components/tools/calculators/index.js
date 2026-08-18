import { OhmsLawCalculator } from "./OhmsLawCalculator";
import { ResistorColorCodeCalculator } from "./ResistorColorCodeCalculator";
import { FiveBandResistorColorCodeCalculator } from "./FiveBandResistorColorCodeCalculator";
import { SeriesResistorCalculator } from "./SeriesResistorCalculator";
import { ParallelResistorCalculator } from "./ParallelResistorCalculator";
import { VoltageDividerCalculator } from "./VoltageDividerCalculator";
import { RcTimeConstantCalculator } from "./RcTimeConstantCalculator";
import { Timer555AstableCalculator } from "./Timer555AstableCalculator";
import { Timer555MonostableCalculator } from "./Timer555MonostableCalculator";
import { CapacitiveReactanceCalculator } from "./CapacitiveReactanceCalculator";
import { LedSeriesResistorCalculator } from "./LedSeriesResistorCalculator";
import { BatteryLifeCalculator } from "./BatteryLifeCalculator";
import { RmsVoltageCalculator } from "./RmsVoltageCalculator";
import { HighPassFilterCalculator } from "./HighPassFilterCalculator";
import { LowPassFilterCalculator } from "./LowPassFilterCalculator";
import { OpAmpGainCalculator } from "./OpAmpGainCalculator";
import { CapacitorCodeValueConverter } from "./CapacitorCodeValueConverter";
import { CapacitanceConversion } from "./CapacitanceConversion";
import { TemperatureConversion } from "./TemperatureConversion";
import { DecimalBinaryOctalHexConverter } from "./DecimalBinaryOctalHexConverter";
import { BinaryBitShiftCalculator } from "./BinaryBitShiftCalculator";
import { OnesComplementCalculator } from "./OnesComplementCalculator";
import { TwosComplementCalculator } from "./TwosComplementCalculator";
import { AsciiToHexConverter } from "./AsciiToHexConverter";
import { HexToAsciiConverter } from "./HexToAsciiConverter";
import { LogBase2Calculator } from "./LogBase2Calculator";
import { BinaryCalculator } from "./BinaryCalculator";
import { HexCalculator } from "./HexCalculator";
import { AccelerationCalculator } from "./AccelerationCalculator";
import { ForceMassAccelerationCalculator } from "./ForceMassAccelerationCalculator";
import { SpeedDistanceTimeCalculator } from "./SpeedDistanceTimeCalculator";
import { WavelengthCalculator } from "./WavelengthCalculator";
import { FrequencyToPeriodCalculator } from "./FrequencyToPeriodCalculator";
import { PercentageChangeCalculator } from "./PercentageChangeCalculator";
import { SquareRootCalculator } from "./SquareRootCalculator";
import { CubeRootCalculator } from "./CubeRootCalculator";

export const CALCULATOR_COMPONENTS = {
  "ohms-law-calculator": OhmsLawCalculator,
  "resistor-color-code-calculator": ResistorColorCodeCalculator,
  "5-band-resistor-color-code-calculator": FiveBandResistorColorCodeCalculator,
  "series-resistor-calculator": SeriesResistorCalculator,
  "parallel-resistor-calculator": ParallelResistorCalculator,
  "voltage-divider-calculator": VoltageDividerCalculator,
  "rc-time-constant-calculator": RcTimeConstantCalculator,
  "555-timer-astable-circuit-calculator": Timer555AstableCalculator,
  "555-timer-monostable-circuit-calculator": Timer555MonostableCalculator,
  "capacitive-reactance-calculator": CapacitiveReactanceCalculator,
  "led-series-resistor-calculator": LedSeriesResistorCalculator,
  "battery-life-calculator": BatteryLifeCalculator,
  "rms-voltage-calculator": RmsVoltageCalculator,
  "high-pass-filter-calculator": HighPassFilterCalculator,
  "low-pass-filter-calculator": LowPassFilterCalculator,
  "op-amp-gain-calculator": OpAmpGainCalculator,
  "capacitor-code-value-converter": CapacitorCodeValueConverter,
  "capacitance-conversion": CapacitanceConversion,
  "temperature-conversion": TemperatureConversion,
  "decimal-binary-octal-hex-converter": DecimalBinaryOctalHexConverter,
  "binary-bit-shift-calculator": BinaryBitShiftCalculator,
  "ones-1s-complement-calculator": OnesComplementCalculator,
  "twos-2s-complement-calculator": TwosComplementCalculator,
  "ascii-to-hex-converter": AsciiToHexConverter,
  "hex-to-ascii-converter": HexToAsciiConverter,
  "log-base-2-calculator": LogBase2Calculator,
  "binary-calculator": BinaryCalculator,
  "hex-calculator": HexCalculator,
  "acceleration-calculator": AccelerationCalculator,
  "force-mass-acceleration-calculator": ForceMassAccelerationCalculator,
  "speed-distance-time-calculator": SpeedDistanceTimeCalculator,
  "wavelength-calculator": WavelengthCalculator,
  "frequency-to-period-calculator": FrequencyToPeriodCalculator,
  "percentage-change-calculator": PercentageChangeCalculator,
  "square-root-calculator": SquareRootCalculator,
  "cube-root-calculator": CubeRootCalculator
};
