"use client"

import * as React from "react"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FormComponent } from "@/components/Form"
import { FormFieldGroup, FormMode } from "@/type/form.type"

const sizeMap = {
  sm:   "sm:max-w-sm",
  md:   "sm:max-w-md",
  lg:   "sm:max-w-lg",
  xl:   "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
  full: "sm:max-w-[90vw]",
} as const

export type FormModalProps<TSchema extends z.ZodObject<any>> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: keyof typeof sizeMap

  fields: FormFieldGroup[]
  schema?: TSchema
  onSubmit: (data: z.infer<TSchema>) => void | Promise<void>
  onDelete?: (data: z.infer<TSchema>) => void
  defaultValues?: any
  submitLabel?: string
  deleteLabel?: string
  loading?: boolean
  disabled?: boolean
  hideSubmitButton?: boolean
  isEdit?: boolean
  isView?: boolean
  formMode?: FormMode
  formKey?: string | number

  closeOnOverlayClick?: boolean
  closeOnEscapeKey?: boolean
}

export function FormModal<TSchema extends z.ZodObject<any>>({
  open,
  onOpenChange,
  title,
  description,
  size = "2xl",
  fields,
  schema,
  onSubmit,
  onDelete,
  defaultValues,
  submitLabel = "Simpan",
  deleteLabel = "Hapus",
  loading = false,
  disabled = false,
  hideSubmitButton = false,
  isEdit = false,
  isView = false,
  formMode = "create",
  formKey,
  closeOnOverlayClick = false,
  closeOnEscapeKey = false,
}: FormModalProps<TSchema>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${sizeMap[size]} overflow-y-auto overflow-x-visible max-h-[90vh] bg-white`}
        onPointerDownOutside={(e) => { if (!closeOnOverlayClick) e.preventDefault() }}
        onEscapeKeyDown={(e) => { if (!closeOnEscapeKey) e.preventDefault() }}
        onInteractOutside={(e) => { if (!closeOnOverlayClick) e.preventDefault() }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <FormComponent
          key={formKey}
          title={title}
          fields={fields}
          schema={schema}
          onSubmit={onSubmit as any}
          onDelete={onDelete}
          defaultValues={defaultValues}
          submitLabel={submitLabel}
          deleteLabel={deleteLabel}
          loading={loading}
          disabled={disabled}
          hideSubmitButton={hideSubmitButton}
          isEdit={!!defaultValues && !disabled}
          isView={disabled}
          formMode={formMode}
        />
      </DialogContent>
    </Dialog>
  )
}