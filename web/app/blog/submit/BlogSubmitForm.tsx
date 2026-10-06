"use client";

import { useActionState } from "react";
import { retainedFormSubmit } from "@/lib/use-retained-form";
import { BLOG_CATEGORIES } from "@/lib/types";
import { PostContentFields } from "@/components/blog/PostContentFields";
import { submitPost } from "./actions";

const inputClasses = "h-11 w-full rounded-[10px] border border-border-input px-3 text-sm";
const labelClasses = "flex flex-col gap-1.5 text-sm font-semibold";

export function BlogSubmitForm({ imageBase }: { imageBase?: string }) {
  const [error, formAction, pending] = useActionState(submitPost, undefined);

  return (
    <form onSubmit={retainedFormSubmit(formAction)} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-xl bg-[#FBEAE3] px-4 py-3 text-sm text-[#9C3D10]">
          {error}
        </p>
      )}

      <PostContentFields
        imageBase={imageBase}
        titlePlaceholder="Post title"
        titleClassName="w-full border-0 border-b border-border-default pb-3 font-serif text-[30px] font-medium text-text-primary outline-none"
      />

      <label className={labelClasses}>
        Category
        <select name="category" required defaultValue="" className={inputClasses}>
          <option value="" disabled>
            Choose a category
          </option>
          {BLOG_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClasses}>
        Tags <span className="font-normal text-text-secondary">(optional, comma-separated)</span>
        <input name="tags" placeholder="Reunion, Memories" className={inputClasses} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-xl bg-brand-green px-6 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </form>
  );
}
