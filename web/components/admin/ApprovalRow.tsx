import { Avatar } from "@/components/ui/Avatar";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

export function ApprovalRow({
  initials,
  title,
  subtitle,
}: {
  initials: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3.5 border-b border-[#EFEAE0] px-6 py-4 last:border-0">
      <Avatar initials={initials} size="sm" />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[13px] text-text-secondary">{subtitle}</span>
      </div>
      <button
        aria-label="Reject"
        className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-input bg-white text-text-secondary"
      >
        <CloseIcon />
      </button>
      <button className="flex h-10 items-center gap-1.5 rounded-[10px] bg-brand-green px-3.5 text-sm font-semibold text-white">
        <CheckIcon /> Approve
      </button>
    </div>
  );
}
