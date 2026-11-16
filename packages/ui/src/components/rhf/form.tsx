"use client"

import type { ComponentProps } from "react"
import {
  FormProvider,
  useFormState,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form"

export function Form<Values extends FieldValues>({
  form,
  onSubmit,
  disabled,
  children,
  ...props
}: Omit<ComponentProps<"form">, "onSubmit"> & {
  form: UseFormReturn<Values>
  onSubmit: SubmitHandler<Values>
  disabled?: boolean
}) {
  const { isSubmitting } = useFormState({ control: form.control })
  return (
    <FormProvider {...form}>
      <form
        {...props}
        noValidate
        onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
      >
        <fieldset disabled={disabled || isSubmitting} className="contents">
          {children}
        </fieldset>
      </form>
    </FormProvider>
  )
}
