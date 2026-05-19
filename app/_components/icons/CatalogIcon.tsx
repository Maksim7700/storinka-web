type IconProps = { className?: string };

export function CatalogIcon({ className }: IconProps) {
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
        d="M3.75 19.5V6.75A2.25 2.25 0 016 4.5h3.75v15H6a2.25 2.25 0 01-2.25-2.25v-.75z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 4.5h8.25a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H9.75"
      />
    </svg>
  );
}
