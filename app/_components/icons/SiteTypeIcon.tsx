type IconProps = { className?: string };

export function SiteTypeIcon({ className }: IconProps) {
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
        d="M3 4.5h18M5.25 4.5v15a.75.75 0 00.75.75h12a.75.75 0 00.75-.75v-15M9 9h6M9 13.5h6M9 18h3"
      />
    </svg>
  );
}
