import { useMedia } from "use-media";

export function useMedia768() {
  return useMedia({ maxWidth: "768px" });
}
export function useMedia1080() {
  return useMedia({ maxWidth: "1080px" });
}
