# Portfolio Readability, Tools, and Story Redesign

**Date:** 2026-08-18  
**Status:** Approved by the user through the instruction to implement the recommended three-milestone release without stopping.

## Goal

Turn the portfolio into a readable, visually balanced engineering site whose strongest hook is a useful collection of free tools. Repair the small and cropped interface elements shown in the supplied screenshots, redesign Home and About around a clearer personal story, improve calculator discovery, and expand the Sensor and AI generators with current practical workflows.

The screenshots are visual evidence only. The user's written requirements define the work.

## Release structure

The work ships as one coordinated release in three internal milestones:

1. Readability, Contact, Home, About, metadata, and shared interaction cleanup.
2. Electronics calculator discovery, thumbnails, inline explanations, and scroll guidance.
3. Sensor Generator and AI Script Generator expansion.

Each milestone must preserve the current static Next.js export and GitHub Pages base path.

## Visual direction

Keep the dark engineering-console identity, cyan and green system colors, square borders, and deliberate pixel details. Reduce the parts that currently feel like a debug interface rather than a portfolio:

- Body copy uses the reading face at a minimum comfortable desktop size of 17px and never drops below 16px on mobile.
- Interface labels and buttons generally use 14px or larger. Tiny diagnostic labels may use 12px only when they are supplementary rather than required for comprehension.
- Headings remain distinctive but lose excessive narrow columns, forced line breaks, and empty space.
- Controls use visible inner padding, clear focus rings, and a minimum 48px target height.
- Button and card labels remain on one line where space allows. External-link arrow glyphs are removed from primary calls to action, Contact links, tool cards, and list rows.
- Motion uses short reveal, offset-image, and progress-line animations. It must respect `prefers-reduced-motion`.

## Shared readability fixes

### List badges

The current post badge places a generated `L` and the numeric index in a 40×36 box, which causes the cropped result shown in attachments 1 and 2. Replace this with a single explicit badge component or a correctly sized two-row badge:

- 52×52px on desktop and at least 48×48px on mobile.
- Cyan background, dark high-contrast text, bold weight, centered in both axes.
- `L` and the two-digit number are both visible without clipping.
- The badge is decorative to screen readers when the neighboring content already conveys order.

### Text and controls

- Raise the shared UI scale for navigation, cards, filters, tool fields, helper text, and result labels.
- Prevent CTA labels from wrapping through `white-space: nowrap` at normal widths and use full-width controls only where mobile space requires it.
- Remove standalone arrow columns from post cards and tool cards. Hover/focus state is communicated through color, border, and a small translation.
- Preserve keyboard focus and sufficient color contrast in default and selected states.

## Contact page

The form becomes a straightforward two-column inquiry layout rather than a large bordered terminal panel.

- Labels sit above fields with a clear 10–12px gap.
- Text inputs receive 16px horizontal padding, 14px vertical padding, a minimum 54px height, and 16px text.
- The textarea receives the same inset padding so placeholder and entered text never touch the top-left border.
- Placeholder color is readable but subordinate.
- The submit button has a single-line label with no arrow glyph.
- Contact methods become compact, single-line rows with readable type and no separate arrow cell.
- On mobile, the form precedes direct-contact methods and all controls remain inside the viewport.

## Home page

### Hero

The hero sells three things immediately: Ahmed's engineering identity, the kind of systems he builds, and the availability of free tools.

- Use a balanced two-column layout instead of text competing with a large decorative scene.
- Use two existing, factual images: the professional portrait and the hardware-bench image. Present them as an offset image pair, not duplicated full-size portraits.
- Add a prominent `Explore free engineering tools` CTA alongside the work/contact actions.
- Add a short proof line describing the actual tool collection without fabricated usage counts or testimonials.

### Tools hook

Immediately after the hero, show a compact free-tools strip with representative entries from electronics, sensor code, and AI workflows. Its CTA leads to the Tools hub. This is a primary navigation path, not a footer promotion.

## About page

Replace the oversized narrow headline and large empty left region with an editorial introduction:

- Left side: offset pair of the professional portrait and hardware/workshop image.
- Right side: a natural headline, short origin story, and direct links to experience, publications, and CV.
- Keep line length between roughly 45 and 68 characters for narrative text.
- Follow with three concise story blocks: curiosity, building across disciplines, and teaching/documentation.
- Existing experience, courses, technical capabilities, publications, tutorials, and factual records remain, but their headings and spacing follow the new readable scale.
- Reveal animation brings the image pair and copy into the center together rather than animating one remote column.

## Electronics calculators

### Tools hub order

The calculator experience begins immediately after a compact Tools introduction. The five advanced workbenches remain available but move below the calculator discovery area so visitors can start calculating without scrolling past a large centered marketing block.

The first viewport contains:

1. A left-aligned label and concise heading.
2. One short explanation of what the calculators do.
3. The search field and category filters.
4. A text-and-progress-line scroll cue labeled `Browse calculators below` with no arrow glyph.

### Catalog behavior

- Search and filtering stay on the Tools page and update results instantly.
- Result count is announced accessibly.
- Categories use readable pressed-state buttons and wrap cleanly.
- Calculator cards contain an original thumbnail, title, one-sentence explanation, category, and key formula/topic tags.
- Cards have no separate arrow button. The complete card title/link remains the interaction target.
- Individual calculator routes remain for focused use, bookmarking, search indexing, and sharing.
- Each calculator route adds a compact local search/filter drawer or related-calculator chooser so users do not need to return to the hub to switch tools.
- A short worked explanation remains above the interactive calculation panel, followed by the formula, example, and source attribution.

### Artwork and attribution

Do not download and republish Last Minute Engineers' visual design or calculator graphics. Their disclaimer allows credited transformation of material but separately restricts reproduction of design, layout, appearance, and graphics, which makes direct copying unnecessarily risky.

Create original schematic-style SVG thumbnails using the portfolio's own lines, component symbols, labels, and category colors. Existing calculator source links remain visible for factual attribution. Thumbnails may share a category visual system but must include calculator-specific labels or symbols.

## Sensor and Communication Code Generator

The current single `Sensor` selector incorrectly mixes sensors, communication protocols, and ESP32-S3 interfaces. Replace it with a registry-driven chooser.

### Top-level groups

1. **Sensors:** environmental, motion, distance, light, analog, gas, and load/force devices.
2. **Communication:** ESP-NOW, Wi-Fi HTTP, MQTT, BLE, UART, I2C, and SPI examples.
3. **Camera and interfaces:** ESP32-S3 USB CDC and OV2640 camera examples.

### Initial supported entries

Preserve the existing BME280, MPU6050, HC-SR04, IR obstacle, DHT11, DHT22, MQ-2, PIR, ESP-NOW, UART, USB CDC, and OV2640 templates. Add a bounded practical set:

- BMP280, DS18B20, BH1750, VL53L0X, ADS1115, HX711, and capacitive soil moisture.
- Wi-Fi HTTP client, Wi-Fi web server, MQTT publisher, MQTT subscriber, BLE server, BLE client, I2C scanner/master, and SPI transfer.

Every entry declares supported environment, protocol, parameters, wiring/pin notes, dependencies, output filename, and validated generator function.

### Example presets

Add one-click presets that populate a complete configuration:

- Weather station
- Motion alarm
- Distance logger
- ESP-NOW sensor node
- MQTT telemetry node
- BLE sensor beacon
- Camera stream

The result area shows generated code, wiring or connection notes, dependencies, and a short explanation of what the example does. Unsupported combinations return a typed, visible error without destroying the user's previous valid configuration.

## AI Script Generator

### Current-model upgrade

The existing YOLO workflows are fixed to YOLOv8. Make YOLO26 the default current family while keeping YOLO11 and YOLOv8 as explicit compatibility choices where the generated API remains supported.

The implementation follows official Ultralytics documentation available on 2026-08-18:

- YOLO26 object detection
- YOLO26 instance segmentation
- YOLO26 semantic segmentation
- YOLO26 monocular depth estimation from a single RGB camera
- YOLOE-26 open-vocabulary detection and segmentation

Generated requirements must respect Ultralytics' AGPL-3.0/Enterprise licensing notice and avoid promising license suitability.

### Detection examples

Object detection offers multiple factual starter presets rather than a single generic dataset path:

- People and vehicles using pretrained COCO classes
- PPE and hard-hat custom detection
- Electronic component or surface-defect custom detection
- Small-object aerial or workshop detection
- Open-vocabulary text prompts through YOLOE-26

Each preset explains whether it is inference-only, fine-tuning, or custom training and identifies the expected dataset layout.

### Depth workflow

Add a YOLO26 depth task for image, video, or webcam inference, optional validation/training configuration, visualization, and supported export choices. Generated code reads `result.depth.data` and explains that monocular depth is an estimate rather than calibrated stereo measurement.

### Segmentation examples

Keep YOLO instance segmentation and add YOLO26 semantic segmentation. Add a dedicated U-Net semantic-segmentation recipe with multiple presets:

- Binary foreground/background masks
- Road-scene multiclass masks
- Industrial surface-defect masks

U-Net code uses a complete, runnable TensorFlow/Keras training pipeline with paired image/mask loading, deterministic split, augmentation, metrics, checkpointing, evaluation, prediction, and SavedModel/TFLite export where compatible.

### Model Mission integration

New tasks participate in the existing Model Mission architecture rather than creating a second UI:

- catalog and taxonomy records
- lazy recipe loading
- shared sectioned project configuration
- control definitions and explanations
- generated project bundle and prediction script
- downloadable source and requirements
- validation and recommendation contracts

The UI scale is raised in the Model Mission shell, tabs, fields, helpers, and code panels to match the global readability standard.

## Metadata and page titles

- Stop automatically appending `Ahmed Asl` to every browser title.
- Use natural intent-based titles such as `Free Electronics, Embedded and AI Tools`, `About — Embedded Systems, IoT and Teaching`, and `Start an Embedded or IoT Project`.
- Keep `Ahmed Asl` as the Open Graph site name, author identity, profile schema identity, and home-page identity where it is contextually useful.
- Preserve canonical URLs, descriptions, robots metadata, sitemap entries, and structured data.

## Architecture

### Shared UI

- Introduce small focused components for indexed badges, image pairs, scroll cues, tool thumbnails, and tool-discovery controls.
- Keep shared tokens and responsive rules in the existing theme rather than page-level inline styles.
- Move inline styles out of Sensor Generator into named classes.

### Registries

- Sensor/communication entries live in a single immutable catalog used by the chooser, parameter form, examples, validation, and code generation.
- AI tasks follow the existing recipe catalog and lazy-loader boundaries.
- Calculator thumbnail configuration extends the existing calculator metadata without coupling the data catalog to React components.

### Data flow

- Search/filter state remains client-local and URL-independent for fast interaction.
- Selecting a Sensor example resolves to a registry entry plus parameter defaults, then passes through validation before generation.
- Model Mission continues to use one canonical `ProjectConfig`; task changes normalize incompatible fields before generator resolution.

## Error handling

- Empty searches show a friendly reset option and announced result count.
- Invalid calculator input produces a local neutral result rather than `NaN` or broken layout.
- Sensor registry validation fails tests if an entry lacks generator, protocol, environment, parameter schema, or documentation.
- AI recipe loading returns typed configuration errors and never silently substitutes a different model task.
- External sources and examples are linked, not fetched at runtime.

## Accessibility and responsive behavior

- All interactive targets are at least 44×44px; primary form controls target 48–54px.
- Search result counts and calculator results use polite live regions.
- Filter buttons expose pressed state.
- Cards have one clear focusable destination and no duplicate arrow-only control.
- Image pairs have purposeful alt text; decorative schematic thumbnails are hidden when the card title provides the same information.
- No horizontal overflow at 375, 768, 1024, or 1440px.
- Reduced-motion users see the final layout immediately.

## Testing and acceptance criteria

### Automated

- Existing full test suite remains green.
- Add source and behavior tests for contact padding/readability contracts, badge structure, button arrow removal, title generation, and Home tool hook.
- Add calculator catalog tests for thumbnail metadata, result count, inline discovery, and all 36 static routes.
- Add sensor catalog and generation tests for every new entry and each example preset.
- Add AI catalog, normalization, generator, generated-code, project-bundle, and representative Python parse tests for YOLO26, YOLOE-26, depth, semantic segmentation, and U-Net.
- Extend responsive browser tests to Home, About, Contact, Tools, Sensor Generator, AI Script Generator, and representative calculator routes.

### Visual and live

- Inspect the listed routes on desktop and mobile.
- Confirm Contact placeholders and entered text have visible inset padding.
- Confirm index badges are bold, colored, centered, and uncropped.
- Confirm CTA and contact labels do not wrap unnecessarily and contain no arrow glyphs.
- Confirm About has balanced imagery and no large empty column.
- Confirm calculator search appears in the first viewport and all 36 tools remain reachable.
- Confirm generated scripts and downloads remain functional.
- Build with the `/myPortflio` GitHub Pages prefix, publish editable source to the source branch and static output to main, wait for the Pages deployment, and rerun live responsive checks.

## Non-goals

- Do not copy third-party calculator graphics or site layout.
- Do not add a backend, accounts, analytics, or runtime AI inference.
- Do not invent clients, testimonials, usage counts, research claims, or project outcomes.
- Do not replace the existing advanced Security Mission, PID, or Battery tools beyond shared readability improvements.
