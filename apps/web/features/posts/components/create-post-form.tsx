import { SendIcon } from "lucide-react"
import { useFormState } from "react-hook-form"

import { Button } from "@workspace/ui/components/button"
import { FieldGroup } from "@workspace/ui/components/field"
import { RhfInput } from "@workspace/ui/components/rhf/rhf-input"
import { RhfTextarea } from "@workspace/ui/components/rhf/rhf-textarea"
import { Spinner } from "@workspace/ui/components/spinner"

import type { CreatePostValues } from "../schemas"

/**
 * The post fields and buttons. Render it inside a `Form`: it reads the form
 * from context, and the container owns state and submission.
 */
export function CreatePostForm({ onCancel }: { onCancel?: () => void }) {
  const { isSubmitting } = useFormState<CreatePostValues>()

  return (
    <>
      <FieldGroup>
        <RhfInput<CreatePostValues>
          name="title"
          label="Title"
          autoComplete="off"
        />
        <RhfTextarea<CreatePostValues> name="body" label="Body" rows={4} />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">
          {isSubmitting ? (
            <>
              Publishing… <Spinner data-icon="inline-end" />
            </>
          ) : (
            <>
              Publish <SendIcon data-icon="inline-end" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </>
  )
}
