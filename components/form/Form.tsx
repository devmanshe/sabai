"use client"

import * as React from "react"
import { useForm, FormProvider, UseFormReturn, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { colSpanMap } from "@/type/form.type"
import { FormFieldConfig, FormFieldGroup, FormMode } from "@/type/form.type"
import { ImageUpload } from "@/components/form/ImageUpload"
import { IconPicker } from "@/components/form/IconPicker"
import { FormProps } from "@/type/form.type"
import { cn } from "@/lib/utils"
import CreatableSelect from "react-select/creatable"

// --- HELPER ---
const extractDefaultValues = (groups: FormFieldGroup[] = []) => {
  return groups.reduce((acc, group) => {
    group.fields?.forEach((field) => {
      acc[field.name] = field.defaultValues ?? ""
    })
    return acc
  }, {} as Record<string, any>)
}

// --- SUB COMPONENTS ---
const RoleSelectionInput = ({ formField, form, fieldConfig, disabled }: any) => {
  const roles = fieldConfig.options || []
  return (
    <div className="flex gap-4 flex-col items-center w-full">
      {fieldConfig.label && <span className="text-center text-sm font-medium text-gray-400">{fieldConfig.label}</span>}
      <div className="flex gap-4 w-full">
        {roles.map((role: any) => {
          const isActive = formField.value === role.value
          return (
            <Button
              key={role.value}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "flex-1 h-15 text-base font-semibold transition-all rounded-xl border-2",
                isActive ? "bg-black text-white border-black" : "bg-white text-black border-gray-200"
              )}
              onClick={() => form.setValue(fieldConfig.name, role.value, { shouldValidate: true })}
            >
              {role.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

const renderInput = (fieldConfig: FormFieldConfig, formField: any, form: UseFormReturn<any>, disabled?: boolean) => {
  switch (fieldConfig.type) {
    case "select":
      return (
        <Select value={formField.value ?? ""} onValueChange={formField.onChange} disabled={disabled}>
          <SelectTrigger><SelectValue placeholder={fieldConfig.placeholder} /></SelectTrigger>
          <SelectContent>
            {fieldConfig.options?.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case "textarea":
      return <Textarea {...formField} placeholder={fieldConfig.placeholder} disabled={disabled} />
    case "file":
      return <ImageUpload value={formField.value || []} onChange={formField.onChange} disabled={disabled} />
    case "icon-picker":
      return <IconPicker value={formField.value} onChange={formField.onChange} disabled={disabled} />
    case "role-selection":
      return <RoleSelectionInput formField={formField} form={form} fieldConfig={fieldConfig} disabled={disabled} />
    case "creatable-select":
      return (
        <CreatableSelect
          {...formField}
          isClearable
          isDisabled={fieldConfig.disabled || disabled}
          options={fieldConfig.options || []}
          value={fieldConfig.options?.find(opt => opt.value === formField.value) || (formField.value ? { label: formField.value, value: formField.value } : null)}
          onChange={(selected: any) => {
            const val = selected ? selected.value : "";
            formField.onChange(val);
            if (fieldConfig.onValueChange) fieldConfig.onValueChange(val);
          }}
          onCreateOption={(val) => {
            formField.onChange(val);
            if (fieldConfig.onValueChange) fieldConfig.onValueChange(val);
          }}
          placeholder={fieldConfig.placeholder}
          className="w-full"
        />
      )
    case "phone-input":
      return (
        <PhoneInput
          international
          defaultCountry="ID"
          value={formField.value}
          onChange={(v) => { formField.onChange(v); if (fieldConfig.onValueChange) fieldConfig.onValueChange(v); }}
          className="flex w-full h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
        />
      )

    case "checkbox-group": {
      const currentValues = Array.isArray(formField.value) ? formField.value : [];

      return (
        <div className="grid grid-cols-2 gap-4 border rounded-xl p-4 bg-slate-50/50">
          {fieldConfig.options?.map((opt) => {
            const isChecked = currentValues.includes(opt.value);

            return (
              <div key={opt.value} className="flex items-center space-x-3">
                <Checkbox
                  id={`check-${fieldConfig.name}-${opt.value}`}
                  checked={isChecked}
                  disabled={disabled}
                  onCheckedChange={(checkedState) => {
                    if (checkedState) {
                      formField.onChange([...currentValues, opt.value]);
                    } else {
                      formField.onChange(
                        currentValues.filter((v: string) => v !== opt.value)
                      );
                    }
                  }}
                />
                <label
                  htmlFor={`check-${fieldConfig.name}-${opt.value}`}
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {opt.label}
                </label>
              </div>
            );
          })}
        </div>
      );
    }
    default:
      return <Input {...formField} value={formField.value ?? ""} type={fieldConfig.type} placeholder={fieldConfig.placeholder} disabled={fieldConfig.disabled || disabled} />
  }
}

const ArrayField = ({ fieldConfig, form }: any) => {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: fieldConfig.name });
  return (
    <div className="space-y-2">
      {fields.map((item, index) => (
        <div key={item.id} className="flex gap-2">
          {fieldConfig.fields?.map((subField: any) => (
            <Input key={subField.name} {...form.register(`${fieldConfig.name}.${index}.${subField.name}`)} placeholder={subField.placeholder} />
          ))}
          <Button type="button" variant="destructive" onClick={() => remove(index)}>Hapus</Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => append({})}>Tambah</Button>
    </div>
  )
}

// --- MAIN COMPONENT ---
export function FormComponent<TSchema extends z.ZodObject<any, any>>({
  groups: fields = [],
  schema,
  onSubmit,
  defaultValues,
  formMode = "create",
  isEdit,
  isView,
  isLoading,
  disabled,
  hideSubmitButton = false,
  submitLabel = "Submit",
  onDelete,
  deleteLabel = "Delete",
  form: externalForm,
}: FormProps<TSchema> & { form?: UseFormReturn<any> }) {

  const initialValues = React.useMemo(() => ({
    ...extractDefaultValues(fields),
    ...defaultValues,
  }), [fields, defaultValues])

  const internalForm = useForm<any>({
    resolver: schema ? (zodResolver(schema) as any) : undefined,
    defaultValues: initialValues as any,
  })

  const methods = externalForm || internalForm
  const effectiveMode: FormMode = isView ? "view" : isEdit ? "edit" : formMode

  const mainGroups = fields.filter(g => g.layout !== "aside")
  const asideGroups = fields.filter(g => g.layout === "aside")

  const renderGroup = (group: FormFieldGroup, idx: number) => {
    const visibleFields = group.fields.filter(f => !f.showInModes || f.showInModes.includes(effectiveMode))
    if (!visibleFields.length) return null

    return (
      <div key={idx} className="mb-8 last:mb-0">
        <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">{group.label}</h3>
        <div className="grid grid-cols-12 gap-4">
          {visibleFields.map((field) => (
            <div key={field.name} className={colSpanMap[field.cols as number] || "col-span-12"}>
              <FormField
                control={methods.control}
                name={field.name as any}
                render={({ field: formField }) => (
                  <FormItem>
                    {!field.hideLabel && field.type !== "role-selection" && <FormLabel>{field.label}</FormLabel>}
                    <FormControl>
                      {field.type === "array" 
                        ? <ArrayField fieldConfig={field} form={methods} /> 
                        : renderInput(field, formField, methods, disabled || isView)
                      }
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-12 gap-8">
          {/* Kolom Utama */}
          <div className={asideGroups.length > 0 ? "col-span-12 lg:col-span-8" : "col-span-12"}>
            {mainGroups.map((group, idx) => renderGroup(group, idx))}
          </div>

          {/* Kolom Aside */}
          {asideGroups.length > 0 && (
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {asideGroups.map((group, idx) => renderGroup(group, idx))}
            </div>
          )}
        </div>

        {!isView && (
          <div className="flex gap-4 pt-6">
            {!hideSubmitButton && (
              <Button type="submit" disabled={isLoading} className="flex-1 bg-black text-white h-12 rounded-xl font-bold">
                {isLoading ? "Menyimpan..." : submitLabel}
              </Button>
            )}
            {isEdit && onDelete && (
              <Button type="button" variant="destructive" onClick={() => onDelete(methods.getValues())} className="h-12 rounded-xl font-bold">
                {deleteLabel}
              </Button>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  )
}