import { Folder } from "./types/Folder";

export function getPathString(folders: Folder[]) {
  return (
    "/files" +
    (folders.length === 0 ? "" : "/") +
    folders.map((f) => encodeURIComponent(f.name)).join("/")
  );
}
