import type { JSX } from "solid-js";
import {
  type MountableElement,
  hydrate,
  isDev,
  render as solidRender,
} from "solid-js/web";

export function render(
  app: () => JSX.Element,
  element: MountableElement,
): () => void {
  if (isDev) {
    return solidRender(app, element);
  }
  return hydrate(app, element);
}
