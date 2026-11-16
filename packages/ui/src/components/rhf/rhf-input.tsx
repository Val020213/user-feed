"use client"

import { useController, type FieldValues } from "react-hook-form"

import {
  InputField,
  type InputFieldProps,
} from "@workspace/ui/components/fields/input-field"
import type { RhfFieldProps } from "@workspace/ui/components/rhf/field-state"

type RhfInputProps<Values extends FieldValues> = Omit<
  InputFieldProps,
  "name" | "ref" | "value" | "defaultValue" | "onChange" | "onBlur" | "error"
> &
  RhfFieldProps<Values, string>

export function RhfInput<Values extends FieldValues>({
  name,
  control,
  disabled,
  ...props
}: RhfInputProps<Values>) {
  const { field, fieldState } = useController({ name, control })
  return (
    <InputField
      {...props}
      {...field}
      disabled={disabled}
      error={fieldState.error?.message}
    />
  )
}
