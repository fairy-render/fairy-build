import type { ReactNode } from "react";
import { type Root, createRoot } from "react-dom/client";

export function render(node: ReactNode, element: Element): Root {
	const root = createRoot(element);
	root.render(node);
	return root;
}
