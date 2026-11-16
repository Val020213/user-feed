"use client"

import type { ComponentProps, ReactNode } from "react"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@workspace/ui/components/field"

export type FieldPresentation = {
  label: ReactNode
  description?: ReactNode
  error?: string
  disabled?: boolean
  className?: string
  labelClassName?: string
  orientation?: NonNullable<ComponentProps<typeof Field>["orientation"]>
}

type ControlAttributes = {
  id: string
  "aria-invalid": boolean
  "aria-describedby": string | undefined
}

export function FieldFrame({
  id,
  label,
  description,
  error,
  disabled,
  className,
  labelClassName,
  orientation,
  children,
}: FieldPresentation & {
  id: string
  children: (attributes: ControlAttributes) => ReactNode
}) {
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`
  const describedBy =
    [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined

  return (
    <Field
      className={className}
      orientation={orientation}
      data-invalid={Boolean(error)}
      data-disabled={disabled || undefined}
    >
      <FieldLabel htmlFor={id} className={labelClassName}>
        {label}
      </FieldLabel>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  )
}
