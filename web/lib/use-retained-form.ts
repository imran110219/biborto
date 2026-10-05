import { startTransition } from "react";
import type { FormEvent } from "react";

// React 19 resets a form's uncontrolled fields once its `action` finishes —
// even when the action returned a validation error — so everything the user
// typed disappears. Submitting through onSubmit and calling the
// useActionState dispatcher by hand keeps the same pending/error state
// without the reset.
//
//   const [error, formAction, pending] = useActionState(action, undefined);
//   <form onSubmit={retainedFormSubmit(formAction)}>
export function retainedFormSubmit(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  };
}
