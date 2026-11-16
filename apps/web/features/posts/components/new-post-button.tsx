"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@workspace/ui/components/button"

import { CreatePostFormContainer } from "./create-post-form-container"

/** Opens the create form in a dialog, a bottom sheet on small screens. */
export function NewPostButton({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false)
  // A new key per opening remounts the form, so it starts from its defaults.
  const [formKey, setFormKey] = useState(0)

  function show() {
    setFormKey((key) => key + 1)
    setOpen(true)
  }

  return (
    <>
      <Button onClick={show}>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        New post
      </Button>
      <CreatePostFormContainer
        key={formKey}
        userId={userId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
