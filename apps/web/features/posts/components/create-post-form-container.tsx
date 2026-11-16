import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm, useFormState } from "react-hook-form"

import { Form } from "@workspace/ui/components/rhf/form"
import { toast } from "@workspace/ui/components/sonner"

import { DiscardChangesDialog } from "@/components/discard-changes-dialog"
import { ResponsiveDialog } from "@/components/responsive-dialog"

import { CreatePostError, useCreatePost } from "../hooks/use-create-post"
import { createPostSchema, type CreatePostValues } from "../schemas"
import { CreatePostForm } from "./create-post-form"

const emptyValues: CreatePostValues = { title: "", body: "" }

/**
 * Owns the form, its dialog and the mutation; `CreatePostForm` only renders.
 * Closing waits while the post publishes and asks before discarding a draft.
 */
export function CreatePostFormContainer({
  userId,
  open,
  onOpenChange,
}: {
  userId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutateAsync } = useCreatePost(userId)

  const form = useForm<CreatePostValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: emptyValues,
  })

  const { isDirty, isSubmitting } = useFormState({ control: form.control })

  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  function requestClose() {
    if (isSubmitting) return
    if (isDirty) setConfirmingDiscard(true)
    else onOpenChange(false)
  }

  function handleOpenChange(next: boolean) {
    if (next) onOpenChange(true)
    else requestClose()
  }

  function discard() {
    setConfirmingDiscard(false)
    onOpenChange(false)
  }

  async function submit(values: CreatePostValues) {
    try {
      await mutateAsync(values)
    } catch (error) {
      if (error instanceof CreatePostError && error.field) {
        form.setError(error.field, { message: error.message })
      } else {
        toast.error("We could not publish the post", {
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        })
      }
      return
    }

    onOpenChange(false)
    toast.success("Post created successfully")
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={handleOpenChange}
        disablePointerDismissal
        title="New post"
        description="Create a new post to share your thoughts with the world."
      >
        <Form
          form={form}
          onSubmit={submit}
          aria-label="New post"
          aria-busy={isSubmitting}
          className="flex flex-col gap-4"
        >
          <CreatePostForm onCancel={requestClose} />
        </Form>
      </ResponsiveDialog>
      <DiscardChangesDialog
        open={confirmingDiscard}
        onOpenChange={setConfirmingDiscard}
        onConfirm={discard}
      />
    </>
  )
}
