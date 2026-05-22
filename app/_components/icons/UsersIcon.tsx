type IconProps = { className?: string };

export function UsersIcon({ className }: IconProps) {
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
        d="M15 19.5a3 3 0 00-6 0M19.5 19.5a3 3 0 00-3-3M4.5 19.5a3 3 0 013-3M12 12a3 3 0 100-6 3 3 0 000 6zM17.25 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM6.75 12a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
      />
    </svg>
  );
}
