"use client";

import { deleteSponsor } from "@/app/admin/sponsors/actions";
import { TrashIcon } from "@/components/ui/icons";

export function DeleteSponsorButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteSponsor.bind(null, id)}
      onSubmit={(event) => {
        if (!window.confirm(`Remove the sponsor “${name}”? This cannot be undone.`)) event.preventDefault();
      }}
    >
      <button
        aria-label={`Remove ${name}`}
        title="Remove sponsor"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default bg-white text-[#9C3D10]"
      >
        <TrashIcon />
      </button>
    </form>
  );
}
