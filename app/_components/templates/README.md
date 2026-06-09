# Templates — one source of truth

Each template's **schema** (field list, catalog meta) and **renderer** (React
component) live together in code. Nothing else in the app trusts
`templates.schema_json` from the backend — it's still in the DB for storage
compatibility but is never read on the frontend.

The DB row in `templates` exists only so `user_sites.template_id` has a valid
FK target.

## Folder layout

```
templates/
  README.md
  _internal.ts           ← TemplateDefinition / TemplateMeta types, buildDefaults()
  types.ts               ← TemplateComponent type (React.FC for the renderer)
  registry.ts            ← ALL_TEMPLATES + getTemplate*(key) helpers
  <key>/
    Template.tsx         ← React renderer
    schema.ts            ← TemplateDefinition: key + meta + fields
    index.ts             ← re-exports the definition
```

## Adding a new template

Example: a template called `tiny-cafe`.

### 1. `templates/tiny-cafe/Template.tsx`

```tsx
"use client";
import type { TemplateComponentProps } from "../types";

const DEFAULTS = {
  businessName: "Tiny Café",
  tagline: "Кава за рогом",
  // …render-time fallback values when the client's content_json is empty
};

export function TinyCafeTemplate({ content }: TemplateComponentProps) {
  const c = { ...DEFAULTS, ...(content ?? {}) };
  return (
    <div className="bg-white text-neutral-900">
      <h1>{c.businessName}</h1>
      <p>{c.tagline}</p>
    </div>
  );
}
```

### 2. `templates/tiny-cafe/schema.ts`

```ts
import type { TemplateDefinition } from "../_internal";
import { TinyCafeTemplate } from "./Template";

export const tinyCafe: TemplateDefinition = {
  key: "tiny-cafe",
  meta: {
    name: "Tiny Café",
    description: "Лендінг для маленької кавʼярні з меню та контактами.",
    category: "food",
    thumbnailUrl: "/templates/tiny-cafe.png",
    licensePrice: 1990,
    monthlyPrice: 490,
    tags: ["МЕНЮ", "КАВ'ЯРНЯ"],
    features: [
      { label: "Адаптивний дизайн", icon: "signal" },
      { label: "Меню з цінами",     icon: "file" },
    ],
  },
  fields: [
    { key: "businessName", label: "Назва закладу", type: "string", required: true },
    { key: "tagline",      label: "Слоган",        type: "string" },
    // …all editable fields here, including `repeater` lists if needed
  ],
  Component: TinyCafeTemplate,
};
```

### 3. `templates/tiny-cafe/index.ts`

```ts
export { tinyCafe } from "./schema";
```

### 4. Register it

In `templates/registry.ts`:

```ts
import { tinyCafe } from "./tiny-cafe";

const ALL_TEMPLATES: TemplateDefinition[] = [
  tinyCafe,
];
```

### 5. Add a Flyway migration

A bare `INSERT` is enough — the row is just an FK target. The frontend reads
the actual schema/meta from `schema.ts`.

```sql
-- V<n>__seed_tiny_cafe.sql
INSERT INTO templates (key, name, category, license_price, monthly_price, is_active)
VALUES ('tiny-cafe', 'Tiny Café', 'food', 1990, 490, true);
```

Keep the `key` identical in **all three** places: `schema.ts`,
`registry.ts`, and the SQL `INSERT`.

## Why this layout

- **One file to update** when you add or rename a field. The form, the
  preview, the SEO checklist, and the catalog page all read from the same
  `TemplateDefinition`.
- **TypeScript catches mismatches** at build time — rename a field key and
  the renderer's `content.xxx` access stops type-checking until you sync.
- **Backend stays small** — it just stores rows and proxies images.
  Adding a new template doesn't require touching Java code.
