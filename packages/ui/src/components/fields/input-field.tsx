"use client"

import { useId, type ComponentProps } from "react"

import {
  FieldFrame,
  type FieldPresentation,
} from "@workspace/ui/components/fields/field-frame"
import {
  InputGroup,
  InputGroupInput,
} from "@workspace/ui/components/input-group"

export type InputFieldProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "className"
> &
  FieldPresentation

export function InputField({
  id,
  label,
  description,
  error,
  disabled,
  className,
  labelClassName,
  orientation,
  children,
  ...props
}: InputFieldProps) {
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
        <InputGroup data-disabled={disabled || undefined}>
          <InputGroupInput {...props} {...attributes} disabled={disabled} />
          {children}
        </InputGroup>
      )}
    </FieldFrame>
  )
}
