import type { ReactNode } from "react";
import { type Root, hydrateRoot } from "react-dom/client";

export function render(node: ReactNode, element: Element): Root {
	const root = hydrateRoot(element, node);
	return root;
}
