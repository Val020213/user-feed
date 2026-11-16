"use client"

import { cn } from "cn"
import { SearchIcon, XIcon } from "lucide-react"

import {
  InputField,
  type InputFieldProps,
} from "@workspace/ui/components/fields/input-field"
import {
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"

export type SearchFieldProps = Omit<
  InputFieldProps,
  "type" | "value" | "onChange" | "children"
> & {
  value: string
  onValueChange: (value: string) => void
}

/** A search input with a leading icon and a clear button while it has a value. */
export function SearchField({
  value,
  onValueChange,
  labelClassName = "sr-only",
  className,
  ...props
}: SearchFieldProps) {
  return (
    <InputField
      {...props}
      // Our clear button replaces the one WebKit draws in search inputs.
      className={cn(
        "[&_input::-webkit-search-cancel-button]:appearance-none",
        className
      )}
      labelClassName={labelClassName}
      type="search"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    >
      <InputGroupAddon>
        <SearchIcon aria-hidden="true" />
      </InputGroupAddon>
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Clear search"
            onClick={() => onValueChange("")}
          >
            <XIcon aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputField>
  )
}
