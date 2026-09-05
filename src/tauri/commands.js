// src/tauri/commands.js

import { invoke as tauriInvoke } from "@tauri-apps/api/core";

export const invoke = async (command, args = {}) => {
  try {
    const response = await tauriInvoke(command, args);
    return response;
  } catch (error) {
    const message =
      typeof error === "string"
        ? error
        : error?.message || "Unknown error";

    console.error(`[Tauri Error] ${command}:`, message);
    throw new Error(message);
  }
};