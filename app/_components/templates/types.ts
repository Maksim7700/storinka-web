// Shared types for template renderer components.
// Each template is a React component that accepts an optional content map
// (keys matching the template's schema_json.fields[].key) and renders the
// public-facing site. Without `content` it falls back to demo defaults so
// the same component can power both the catalog preview and a real user site.

export type TemplateContent = Record<string, unknown>;

export type TemplateComponentProps = {
  content?: TemplateContent;
};

export type TemplateComponent = (
  props: TemplateComponentProps,
) => React.ReactElement;
