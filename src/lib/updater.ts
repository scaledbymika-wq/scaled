import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

export type { Update };

export async function checkForUpdate(): Promise<Update | null> {
  try {
    const update = await check();
    return update;
  } catch (error) {
    console.error("Update check failed:", error);
    return null;
  }
}

export async function downloadAndInstall(
  update: Update,
  onProgress?: (percent: number) => void
): Promise<void> {
  let totalLength = 0;
  let downloaded = 0;

  await update.downloadAndInstall((event) => {
    switch (event.event) {
      case "Started":
        totalLength = event.data.contentLength ?? 0;
        break;
      case "Progress":
        downloaded += event.data.chunkLength;
        if (totalLength > 0 && onProgress) {
          onProgress(Math.round((downloaded / totalLength) * 100));
        }
        break;
      case "Finished":
        if (onProgress) onProgress(100);
        break;
    }
  });

  await relaunch();
}
