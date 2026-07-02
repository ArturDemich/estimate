# PlantStock

## Printer setup

- **PUTY** printers use the native `PrinterPuty` module (Android).
- **Other label printers** (e.g. XPrinter TT424B) use `react-native-bluetooth-escpos-printer`:
  - **TSC** — TSPL label mode (recommended for XPrinter)
  - **ESC** — ESC/POS with `printPic` + form feed

`react-native-bluetooth-escpos-printer` is patched via `patch-package` (Gradle 8 + AndroidX).

Rebuild Android (no prebuild needed — keeps Puty native module):

```bash
npm install
npx expo run:android
```
