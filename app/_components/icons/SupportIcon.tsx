type IconProps = { className?: string };

export function SupportIcon({ className }: IconProps) {
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
        d="M9.879 16.121a3 3 0 104.243-4.243 3 3 0 00-4.243 4.243zM12 3a9 9 0 100 18 9 9 0 000-18zM4.93 4.93l3.536 3.536M15.536 15.536l3.535 3.535M19.07 4.93l-3.535 3.536M8.464 15.536l-3.535 3.535"
      />
    </svg>
  );
}
