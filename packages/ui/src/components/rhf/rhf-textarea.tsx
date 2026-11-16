"use client"

import { useController, type FieldValues } from "react-hook-form"

import {
  TextareaField,
  type TextareaFieldProps,
} from "@workspace/ui/components/fields/textarea-field"
import type { RhfFieldProps } from "@workspace/ui/components/rhf/field-state"

type RhfTextareaProps<Values extends FieldValues> = Omit<
  TextareaFieldProps,
  "name" | "ref" | "value" | "defaultValue" | "onChange" | "onBlur" | "error"
> &
  RhfFieldProps<Values, string>

export function RhfTextarea<Values extends FieldValues>({
  name,
  control,
  disabled,
  ...props
}: RhfTextareaProps<Values>) {
  const { field, fieldState } = useController({ name, control })
  return (
    <TextareaField
      {...props}
      {...field}
      disabled={disabled}
      error={fieldState.error?.message}
    />
  )
}
