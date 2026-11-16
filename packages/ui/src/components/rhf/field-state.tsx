import type { Control, FieldPathByValue, FieldValues } from "react-hook-form"

export type RhfFieldProps<Values extends FieldValues, Value> = {
  name: FieldPathByValue<Values, Value>
  /** Defaults to the form context that `Form` provides. */
  control?: Control<Values>
}
