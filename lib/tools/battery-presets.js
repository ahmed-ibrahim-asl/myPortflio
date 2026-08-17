// Sleep-current figures are order-of-magnitude reference points, not a datasheet substitute.
// "Bare chip" = the SoC datasheet spec under ideal test-fixture conditions (all peripherals off).
// "Typical dev board" = community-measured current on a common breakout/dev board, where an
// LDO's own quiescent draw, a USB-UART bridge, and a power LED are still pulling current even
// while the MCU sleeps. That gap is usually the actual reason a project's battery life falls
// short of the datasheet's promise, not a mistake in the duty-cycle math.
export const BATTERY_CHIP_PRESETS = Object.freeze([
  {
    id: "esp32-wroom",
    label: "ESP32 (WROOM-32)",
    bareChipUa: 10,
    devBoardUa: 700,
    sourceNote: "Datasheet deep-sleep spec vs. common dev-board measurements (LDO/USB-UART overhead)."
  },
  {
    id: "esp32-c3",
    label: "ESP32-C3",
    bareChipUa: 5,
    devBoardUa: 250,
    sourceNote: "Datasheet spec ~5µA; unmodified dev boards commonly measure 100-500µA."
  },
  {
    id: "esp32-s3",
    label: "ESP32-S3",
    bareChipUa: 7,
    devBoardUa: 275,
    sourceNote: "Datasheet spec ~7µA with RTC retained (~1µA with RTC off); dev-board overhead dominates in practice."
  },
  {
    id: "nrf52840",
    label: "nRF52840",
    bareChipUa: null,
    devBoardUa: null,
    sourceNote: "Figures vary meaningfully by RAM-retention configuration in System OFF/ON — check Nordic's datasheet electrical specification table rather than trust a single number here."
  }
]);

export function getBatteryChipPreset(id) {
  return BATTERY_CHIP_PRESETS.find((preset) => preset.id === id) || null;
}
