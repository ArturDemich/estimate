/**
 * Default (native) export. Metro/Expo resolves @/db/db to db.web.ts on web and db.native.ts on native.
 * This file is the fallback for TypeScript and non-platform builds (e.g. tests).
 */
export * from "./db.native";
