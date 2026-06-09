// Central template registry. Everywhere in the app — admin form, catalog,
// public preview, site editor — reads template data through these helpers
// instead of trusting `templates.schema_json` from the backend.
//
// To add a template:
//   1. Create `templates/<key>/` with Template.tsx + schema.ts + index.ts
//      (see ./README.md for the convention).
//   2. Import the definition here and push it into `ALL_TEMPLATES`.
//   3. Add a Flyway migration that INSERTs a matching row into `templates`
//      (the row is just there so user_sites.template_id has a target).
// Keep keys identical across all three places.

import type { TemplateField } from "../../admin/sites/_components/ContentForm";
import type { TemplateDefinition, TemplateMeta } from "./_internal";
import type { TemplateComponent } from "./types";

const ALL_TEMPLATES: TemplateDefinition[] = [
  // Add new definitions here, e.g.:
  //   import { adovaPortfolio } from "./adova-portfolio";
  //   ALL_TEMPLATES.push(adovaPortfolio);
];

/** Indexed for O(1) lookups; the array stays the public iterable. */
const BY_KEY: Map<string, TemplateDefinition> = new Map(
  ALL_TEMPLATES.map((t) => [t.key, t]),
);

export function getTemplateDefinition(
  key: string,
): TemplateDefinition | null {
  return BY_KEY.get(key) ?? null;
}

/** Convenience wrappers — most callers only need one slice. */
export function getTemplateComponent(key: string): TemplateComponent | null {
  return BY_KEY.get(key)?.Component ?? null;
}

export function getTemplateFields(key: string): TemplateField[] {
  return BY_KEY.get(key)?.fields ?? [];
}

export function getTemplateMeta(key: string): TemplateMeta | null {
  return BY_KEY.get(key)?.meta ?? null;
}

export function getAllTemplates(): TemplateDefinition[] {
  return ALL_TEMPLATES;
}
