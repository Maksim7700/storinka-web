type IconProps = { className?: string };

export function EmptyStateIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 13.5h6M9 16.5h4.5" />
    </svg>
  );
}
