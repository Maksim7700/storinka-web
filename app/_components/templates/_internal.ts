// Shared types for the new "one-source" template definition.
//
// Idea: each template lives in its own folder
//   templates/<key>/
//     Template.tsx   ← React renderer
//     schema.ts      ← TemplateDefinition (key + meta + fields)
//     index.ts       ← re-exports both
//
// `registry.ts` imports all `index.ts`s and exposes lookup helpers.
// Everywhere else in the app reads from the registry — never from the
// backend's `templates.schema_json`. That column stays for storage compat
// but is *not* the source of truth anymore.

import type { TemplateField } from "../../admin/sites/_components/ContentForm";
import type { TemplateComponent } from "./types";

/** Catalog-level metadata that used to live in `templates.schema_json` plus
 * the dedicated columns on the `templates` table. Now defined in code; the
 * backend `templates` row is just an FK target for `user_sites.template_id`. */
export type TemplateMeta = {
  name: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  licensePrice: number;
  monthlyPrice: number;
  tags?: string[];
  features?: { label: string; icon?: string }[];
};

/** A template fully described in code — what the admin form renders, what the
 * catalog shows, what `<preview>` mounts. The single source of truth. */
export type TemplateDefinition = {
  key: string;
  meta: TemplateMeta;
  fields: TemplateField[];
  Component: TemplateComponent;
};

/** Builds an empty-form snapshot from a schema. Used when the wizard opens a
 * brand-new site and needs an initial value object for `useState(...)`.
 * Uses `field.default` if present, otherwise a type-appropriate empty:
 *   string/textarea/color/image/url → ""
 *   number                          → 0
 *   repeater                        → []
 * Anything else falls through to "" to keep React inputs controlled. */
export function buildDefaults(
  fields: TemplateField[],
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.default !== undefined) {
      out[f.key] = f.default;
      continue;
    }
    switch (f.type) {
      case "number":
        out[f.key] = 0;
        break;
      case "repeater":
        out[f.key] = [];
        break;
      default:
        out[f.key] = "";
    }
  }
  return out;
}
