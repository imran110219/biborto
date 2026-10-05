import { Avatar } from "@/components/ui/Avatar";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";

const rejectButtonClasses =
  "flex h-10 w-10 items-center justify-center rounded-[10px] border border-border-input bg-white text-text-secondary";
const approveButtonClasses =
  "flex h-10 items-center gap-1.5 rounded-[10px] bg-brand-green px-3.5 text-sm font-semibold text-white";

// onApprove/onReject are Server Actions (see e.g. app/admin/members/actions.ts),
// already bound to the row's id by the caller. Left undefined where the
// backing mutation doesn't exist yet (see docs/web/README.md's "Still on
// mock data") — the buttons then render inert, same as before.
export function ApprovalRow({
  initials,
  title,
  subtitle,
  onApprove,
  onReject,
  readOnly = false,
}: {
  initials: string;
  title: string;
  subtitle: string;
  onApprove?: (formData: FormData) => void | Promise<void>;
  onReject?: (formData: FormData) => void | Promise<void>;
  // Hides the approve/reject controls for viewers who may not act on the row.
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-3.5 border-b border-[#EFEAE0] px-6 py-4 last:border-0">
      <Avatar initials={initials} size="sm" />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[15px] font-semibold">{title}</span>
        <span className="text-[13px] text-text-secondary">{subtitle}</span>
      </div>
      {readOnly ? null : onReject ? (
        <form action={onReject}>
          <button aria-label="Reject" type="submit" className={rejectButtonClasses}>
            <CloseIcon />
          </button>
        </form>
      ) : (
        <button aria-label="Reject" className={rejectButtonClasses}>
          <CloseIcon />
        </button>
      )}
      {readOnly ? null : onApprove ? (
        <form action={onApprove}>
          <button type="submit" className={approveButtonClasses}>
            <CheckIcon /> Approve
          </button>
        </form>
      ) : (
        <button className={approveButtonClasses}>
          <CheckIcon /> Approve
        </button>
      )}
    </div>
  );
}
