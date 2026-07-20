import { UseFormReturn } from "react-hook-form"
import {z} from "zod"

export type FieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "checkbox-group"
  | "file"
  | "array"
  | "custom"
  | "icon-picker"
  | "password"
  | "role-selection"
  | "creatable-select"
  | "phone-input"

export type FieldOption = {
  label: string
  value: string
}

export type RoleSelect = {
  field: FormFieldConfig
  form: UseFormReturn<any>
}

export const colSpanMap: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

export type FormMode = "view" | "edit" | "create"

export type FormFieldConfig = {
  name: string
  label?: string
  type: FieldType

  placeholder?: string
  defaultValues?: any
  onValueChange?: (value: any) => void;

  options?: FieldOption[]

  cols?: number
  fullWidth?: boolean

  hideLabel?: boolean

  multiple?: boolean

  showInModes?: FormMode[]
  disabled?: boolean
  readOnly?: boolean

  component?: (props: {
    field: FormFieldConfig
    form: UseFormReturn<any>
  }) => React.ReactNode

  // nested
  fields?: FormFieldConfig[]
}

export type GroupLayout = "default" | "aside"

export type FormFieldGroup = {
  label: string
  fields: FormFieldConfig[]

  layout?: "main" | "aside"

  expandable?: boolean
  defaultOpen?: boolean
}

export type FormProps<TSchema extends z.ZodTypeAny> = {
  title: string
  description?: string

  groups: FormFieldGroup[]
  schema?: TSchema

  onSubmit: (values: any) => void
  onDelete?: (data: any) => void
  register?: string

  defaultValues?: Partial<z.infer<TSchema>>

  submitLabel?: string
  deleteLabel?: string

  formMode?: FormMode

  isLoading?: boolean
  disabled?: boolean
  isEdit?: boolean
  isView?: boolean
  readOnly?: boolean

  children?: boolean

  hideSubmitButton?: boolean
}

export type ModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full"

export type FormModalProps<TSchema extends z.ZodObject<any>> = {
  open: boolean
  onOpenChange: (open: boolean) => void

  title: string
  description?: string

  size?: ModalSize

  fields: FormFieldGroup[]
  schema?: TSchema

  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>
  onDelete?: (data: z.infer<TSchema>) => void

  defaultValues?: Partial<z.infer<TSchema>>

  submitLabel?: string
  deleteLabel?: string

  loading?: boolean
  disabled?: boolean

  formMode?: FormMode
}

export type DependentSelectProps = {
  form: any
  name: string
  label?: string
  parentName?: string
  fetchHook: (parentValue?: string) => {
    data?: any[]
    isLoading: boolean
  }
  mapOption?: (item: any) => FieldOption
  placeholder?: string
}