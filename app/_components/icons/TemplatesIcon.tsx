type IconProps = { className?: string };

export function TemplatesIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 4.5h6v6h-6zM14.25 4.5h6v6h-6zM3.75 14.25h6v6h-6zM14.25 14.25h6v6h-6z"
      />
    </svg>
  );
}
