type IconProps = { className?: string; size?: number };

function base(paths: React.ReactNode, { className, size = 18 }: IconProps = {}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths}
    </svg>
  );
}

export const ArrowRightIcon = (p: IconProps = {}) =>
  base(<path d="M5 12h14M13 6l6 6-6 6" />, { size: 16, ...p });

export const BriefcaseIcon = (p: IconProps = {}) =>
  base(
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </>,
    { size: 15, ...p }
  );

export const PinIcon = (p: IconProps = {}) =>
  base(
    <>
      <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>,
    { size: 15, ...p }
  );

export const CalendarIcon = (p: IconProps = {}) =>
  base(
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>,
    p
  );

export const ClockIcon = (p: IconProps = {}) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    p
  );

export const SearchIcon = (p: IconProps = {}) =>
  base(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
    p
  );

export const MenuIcon = (p: IconProps = {}) => base(<path d="M3 6h18M3 12h18M3 18h18" />, { size: 20, ...p });

export const CloseIcon = (p: IconProps = {}) => base(<path d="M6 6l12 12M18 6 6 18" />, { size: 16, ...p });

export const CheckIcon = (p: IconProps = {}) => base(<path d="m5 12 5 5 9-10" />, { size: 16, ...p });

export const EditIcon = (p: IconProps = {}) => base(<path d="M4 20h4L19 9l-4-4L4 16z" />, { size: 15, ...p });

export const TrashIcon = (p: IconProps = {}) =>
  base(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />, { size: 15, ...p });

export const BellIcon = (p: IconProps = {}) =>
  base(
    <>
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z" />
      <path d="M10 21h4" />
    </>,
    p
  );

export const PlusIcon = (p: IconProps = {}) => base(<path d="M12 5v14M5 12h14" />, { size: 16, ...p });

export const DownloadIcon = (p: IconProps = {}) =>
  base(<path d="M12 4v12M7 11l5 5 5-5M4 20h16" />, { size: 16, ...p });

export const LockIcon = (p: IconProps = {}) =>
  base(
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>,
    { size: 16, ...p }
  );

export const MembersIcon = (p: IconProps = {}) =>
  base(
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
    </>,
    p
  );

export const DocumentIcon = (p: IconProps = {}) =>
  base(
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </>,
    p
  );

export const PhotoIcon = (p: IconProps = {}) =>
  base(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </>,
    p
  );

export const VideoIcon = (p: IconProps = {}) =>
  base(
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="m10 9 5 3-5 3z" />
    </>,
    p
  );

export const SettingsIcon = (p: IconProps = {}) =>
  base(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>,
    p
  );

export const DashboardIcon = (p: IconProps = {}) =>
  base(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>,
    p
  );

export const StarIcon = (p: IconProps = {}) =>
  base(<path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z" />, p);

export const EyeIcon = (p: IconProps = {}) =>
  base(
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    p
  );

export const ExternalLinkIcon = (p: IconProps = {}) => base(<path d="M7 17 17 7M7 7h10v10" />, { size: 16, ...p });

export const MailIcon = (p: IconProps = {}) =>
  base(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>,
    { size: 18, ...p }
  );

export const ShareIcon = (p: IconProps = {}) =>
  base(
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
    { size: 18, ...p }
  );

export const LogoutIcon = (p: IconProps = {}) =>
  base(<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />, p);

export const PlayIcon = (p: IconProps = {}) => base(<path d="M8 5v14l11-7z" fill="currentColor" />, { size: 26, ...p });

export const UploadIcon = (p: IconProps = {}) =>
  base(<path d="M12 3v12M7 8l5-5 5 5M5 21h14" />, { size: 16, ...p });

export const PhoneIcon = (p: IconProps = {}) =>
  base(
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.4a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" />,
    { size: 16, ...p }
  );

export const QuoteIcon = (p: IconProps = {}) =>
  base(<path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6" />, { size: 34, ...p });
