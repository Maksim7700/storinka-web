import { BeautySalonTemplate } from "./BeautySalonTemplate";
import { StoTemplate } from "./StoTemplate";
import type { TemplateComponent } from "./types";

// Map of template.key (from DB) → React component that renders it.
// New templates: implement a component in this folder and add it here.
const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  "beauty-salon": BeautySalonTemplate,
  sto: StoTemplate,
};

export function getTemplateComponent(key: string): TemplateComponent | null {
  return TEMPLATE_COMPONENTS[key] ?? null;
}
