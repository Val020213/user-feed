"use client"

import { useId, type ComponentProps } from "react"

import {
  FieldFrame,
  type FieldPresentation,
} from "@workspace/ui/components/fields/field-frame"
import { Textarea } from "@workspace/ui/components/textarea"

export type TextareaFieldProps = Omit<
  ComponentProps<typeof Textarea>,
  "className"
> &
  FieldPresentation

export function TextareaField({
  id,
  label,
  description,
  error,
  disabled,
  className,
  labelClassName,
  orientation,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId()
  return (
    <FieldFrame
      id={id ?? generatedId}
      label={label}
      description={description}
      error={error}
      disabled={disabled}
      className={className}
      labelClassName={labelClassName}
      orientation={orientation}
    >
      {(attributes) => (
        <Textarea {...props} {...attributes} disabled={disabled} />
      )}
    </FieldFrame>
  )
}
