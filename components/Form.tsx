"use client"

import * as React from "react"
import {
  useForm,
  UseFormReturn,
  FormProvider,
} from "react-hook-form"
import { FormFieldConfig, FormMode, FormFieldGroup } from "@/type/form.type"
import { zodResolver } from "@hookform/resolvers/zod"
import { map, z } from "zod"
import { Button } from "@/components/ui/button"
import { 
  FormLabel, 
  FormItem, 
  FormField, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFieldArray } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import {Checkbox} from "@/components/ui/checkbox";
import {Dialog, DialogContent, DialogTitle} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Files, ChevronDown, X, Trash2 } from "lucide-react"
import { ImageUpload } from "@/components/form/ImageUpload"
import { cn } from "@/lib/utils"
import { IconPicker } from "@/components/form/IconPicker"
import Image from "next/image"

export type FormProps<TSchema extends z.ZodObject<any>> = {
  title: string;
  description?: string;
  fields: FormFieldGroup[];
  schema?: TSchema;
  onSubmit: (data: z.infer<TSchema>) => void;
  onDelete?: (data: z.infer<TSchema>) => void;
  deleteLabel?: string;
  submitLabel?: string;
  cancelLabel?: string;
  defaultValues?: z.infer<TSchema>;
//   size?: FormSize;
  formMode?: FormMode;
  extraContent?: React.ReactNode;
  isEdit?: boolean;
  isView?: boolean;
  loading?: boolean;
  disabled?: boolean;
  hideCancelButton?: boolean;
  hideSubmitButton?: boolean;
  children?: (methods: UseFormReturn<z.infer<TSchema>>) => React.ReactNode;
}

  const extractDefaultValues = (groups: FormFieldGroup[]) => {
    return groups.reduce((acc, group) => {
      group.fields.forEach(field => {
        acc[field.name] = field.defaultValues ?? "";
      })
      return acc;
    }, {} as any);
  };

const AccordionSection = ({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between p-4 font-semibold text-lg text-gray-800 !rounded-md"
      >
        <span>{label}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
        />
      </button>

      {open && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export function FormComponent<TSchema extends z.ZodObject<any>>({
  fields = [] as FormFieldGroup[],
  schema,
  onSubmit,
  onDelete,
  submitLabel = "Confirm",
  deleteLabel = "Delete",
  defaultValues: manualDefaultValues, 
  formMode = "create",
  isEdit = false,
  isView = false,
  loading = false,
  disabled = false,
  hideSubmitButton = false,
  children,
}: FormProps<TSchema>) {

  const colSpanMap: Record<number, string> = {
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

  const rowSpanMap: Record<number, string> = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    5: "row-span-5",
    6: "row-span-6",
  }

  const mainGroups = fields.filter(g => g.layout !=="aside");
  const asideGroups = fields.filter(g => g.layout === "aside")

  const initialValues = React.useMemo(() =>{
    const extracted = extractDefaultValues(fields);
    return{...extracted, ...manualDefaultValues};
}, [fields, manualDefaultValues])
  
  const effectiveMode: FormMode = isView ? "view" : isEdit ? "edit" : formMode;
  
  const methods = useForm<z.infer<TSchema>>({
    resolver: schema ? (zodResolver(schema) as any) : undefined,
    defaultValues: initialValues as any,
    mode: "onChange"
  })

  // const visibleFields = fields.filter((f) => f.showInModes?.includes(effectiveMode));
  const hasInitialized = React.useRef(false);

  React.useEffect(() => {
    if(initialValues){
      methods.reset(initialValues );
    }
  }, [initialValues, methods])

  React.useEffect(() => {
    if(!hasInitialized.current && initialValues){
      methods.reset(initialValues);
      hasInitialized.current = true;
    }
  }, [initialValues, methods]);

  const handleCheckboxGroupChange=(
    value: string,
    currentValues: string[],
    onChange: (val: string[]) => void
  ) => {
    if(currentValues?.includes(value)){
      onChange(currentValues.filter(v => v !== value));
    } else {
      onChange([...(currentValues || []), value])
    }
  }

  const ArrayFieldRenderer = ({
    fieldConfig,
    form,
  }: {
    fieldConfig: FormFieldConfig
    form: UseFormReturn<any>
  }) => {

    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: fieldConfig.name,
    })

    return (
      <div className="flex flex-col gap-3">
        {fields.map((item, index) => (
          <div
            key={item.id}
            className="flex gap-3 items-center bg-muted p-3 rounded-md"
          >
            {fieldConfig.fields?.map((subField) => (
              <Input
                key={subField.name}
                {...form.register(
                  `${fieldConfig.name}.${index}.${subField.name}`
                )}
                placeholder={subField.placeholder}
                type={subField.type}
                className="flex-1"
              />
            ))}

            {/* <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
            >
              ✕
            </Button> */}
            <div className="bg-red-500 rounded-md p-2">
              <Trash2 className="w-5 h-5 text-white" onClick={() => remove(index)}/>


            </div>
          </div>
        ))}

        <Button
          type="button"
          onClick={() => append({})}
          className="w-fit"
        >
          + Tambah Add On
        </Button>
      </div>
    )
  }

  const renderField = (fieldConfig: FormFieldConfig, form: UseFormReturn<any>) => {
    return (
      <FormField 
        key={fieldConfig.name} 
        control={form.control} 
        name={fieldConfig.name} 
        render={({ field: formField }) => (
          <FormItem className="h-full">
            {!fieldConfig.hideLabel &&(
            <FormLabel className="font-semibold text-sm">
              {fieldConfig.label || fieldConfig.name}
            </FormLabel>

            )}
            <FormControl>
              {fieldConfig.type === "select" ? (
                <Select 
                  onValueChange={formField.onChange}
                  value={formField.value ?? ""}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full !rounded-[7px]">
                    <SelectValue placeholder={fieldConfig.placeholder}/>
                  </SelectTrigger>
                  <SelectContent>
                    {fieldConfig.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : fieldConfig.type === "file" ? (
                disabled ? (
                  <PhotoViewGrid photos={formField.value || []}/>
                ) : (
                  <ImageUpload
                    value={formField.value || []}
                    onChange={(files) => {formField.onChange(files)}}
                    disabled={disabled}
                  />
                )
               ) : fieldConfig.type === "checkbox-group" ? (
                <div className={cn
                  ("grid gap-2",
                    fieldConfig.cols === 2 && "grid-cols-2",
                    fieldConfig.cols === 3 && "grid-cols-3",
                    fieldConfig.cols === 4 && "grid-cols-4",
                    !fieldConfig.cols && "grid-cols-1"
                  )}
                >
                  {fieldConfig.options?.map((opt) => {
                    const checked = (formField.value || []).includes(opt.value)
                    return (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox checked={checked} onCheckedChange={(isChecked) => {
                          let newValue = formField.value || []

                          if(isChecked){
                            newValue = [...newValue, opt.value]
                          } else {
                            newValue = newValue.filter(
                              (v: string) => v !== opt.value
                            )
                          }
                          formField.onChange(newValue)
                        }}
                        />
                        <span className="text-md">
                          {opt.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : fieldConfig.type === "custom" && fieldConfig.component ?(
                  fieldConfig.component({
                    field: fieldConfig,
                    form
                  })
              ) : fieldConfig.type === "array" ? (
                    <ArrayFieldRenderer fieldConfig={fieldConfig} form={form}/>
              ) : fieldConfig.type === "textarea" ? (
                <Textarea 
                  {...formField} 
                  value={formField.value ?? ""} 
                  placeholder={fieldConfig.placeholder} 
                  className="min-h-[120px] !rounded-[7px]"
                  disabled={disabled}
                />
              ) : fieldConfig.type === "icon-picker" ? (
                  <IconPicker
                    value={formField.value ?? ""}
                    onChange={formField.onChange}
                    error={form.formState.errors[fieldConfig.name]?.message as string}
                    disabled={disabled}
                  />
              ) : (
                <Input 
                  {...formField} 
                  value={formField.value ?? ""}
                  type={fieldConfig.type} 
                  placeholder={fieldConfig.placeholder} 
                  className="!rounded-[7px]"
                  disabled={disabled}
                />
              )
            }
            </FormControl>
            <div className="">
              <FormMessage className="text-xs italic mt-1 shadow-none"/>
            </div>
          </FormItem>
        )} 
      />
    )
  }

  const renderGroup = (group: FormFieldGroup, idx: number) => {
    const visibleFields = group.fields.filter(f => 
      !f.showInModes || f.showInModes.includes(effectiveMode)
    );
    console.log("effectivemode", effectiveMode)
    console.log("visibleFields", visibleFields.map(f => f.name))

    if (!visibleFields.length) return null;

    return(
      <div key={idx}>
        {group.expandable ? (
          <AccordionSection label={group.label} defaultOpen={group.defaultOpen}>
            <div className="grid grid-cols-12 gap-x-6 gap-y-1 p-4">
              {visibleFields.map(field => {
                const isBlockField = field.fullWidth || [
                  "textarea", "richtext", "file", "multifiles", "checkbox-group", "array", "dynamic-list"
                ].includes(field.type)
              
                return (
                  <div key={field.name} className={isBlockField ? "col-span-12" : field.cols ? colSpanMap[field.cols] : "col-span-12"}>
                    {renderField(field, methods)}
                  </div>
                )
              })}
            </div>
          </AccordionSection>
        ) : (
          <>
            <h3 className="font-semibold p-4">{group.label}</h3>
            <div className="grid grid-cols-12 gap-x-6 gap-y-1 p-4">
              {visibleFields.map(field => (
                <div key={field.name} className={field.cols ? colSpanMap[field.cols] : "col-span-12"}>
                  {renderField(field, methods)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  const PhotoViewGrid = ({ photos }: { photos: string[] }) => {
    const [previewSrc, setPreviewSrc] = React.useState<string | null>(null)

    if (photos.length === 0) {
      return <p className="text-sm text-muted-foreground">Tidak ada foto</p>
    }

    return (
      <>
        <div className="grid grid-cols-3 gap-3 mt-1">
          {photos.map((src, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setPreviewSrc(src)}
            >
              <Image
                src={src}
                alt={`foto-${idx}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <Dialog open={!!previewSrc} onOpenChange={() => setPreviewSrc(null)}>
          <DialogTitle></DialogTitle>
          <DialogContent className="max-w-4xl p-0">
            {previewSrc && (
              <img
                src={previewSrc}
                alt="Preview"
                className="w-full max-h-[85vh] object-contain mx-auto"
              />
            )}
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={methods.handleSubmit(onSubmit as any)} 
        className="space-y-4 text-left"
      >
        <div className="grid grid-cols-12 gap-6">
          <div className={
            asideGroups.length > 0
              ? "col-span-12 lg:col-span-6 space-y-4"
              : "col-span-12 space-y-4" 
          }>
            {mainGroups.map(renderGroup)}
          </div>
          {asideGroups.length > 0 && (
            <div className="col-span-12 lg:col-span-6 space-y-4">
              {asideGroups.map(renderGroup)}
            </div>
          )}
        </div>

        {typeof children === "function" && (
          <div className="col-span-12">
            {children(methods)}
          </div>
        )}
        
        {/* {typeof children === "function" && (children(methods))} */}
        
        <div className="flex flex-col gap-2 mt-6">
          {!hideSubmitButton && (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : submitLabel}
            </Button>
          )}
          {isEdit && onDelete && (
            <Button type="button" variant="destructive" className="w-full" disabled={loading} onClick={() => onDelete(methods.getValues())}>{deleteLabel}</Button>
          )}
        </div>
        
      </form>
    </FormProvider>
  )
}

          {/* {fields.map((group, groupIndex) => {
            const visibleFields = group.fields.filter((f) =>
              f.showInModes?.includes(effectiveMode)
            );

            if (visibleFields.length === 0) return null;

            return (
              <div key={groupIndex} className="col-span-12 border rounded-md mb-4">
                
                {group.expandable ? (
                  <>
                    {group.fields
                      .filter(field => field.ignoreExpandable)
                      .map(field => renderField)
                    }

                  <AccordionSection
                    label={group.label}
                    defaultOpen={group.defaultOpen}
                  >
                    <div className="grid grid-cols-12 gap-x-6 gap-y-1 p-4">
                      {visibleFields.map((field) => (
                        <div
                          key={field.name}
                          className={field.cols ? colSpanMap[field.cols] : "col-span-12"}
                        >
                          {renderField(field, methods)}
                        </div>
                      ))}
                    </div>
                  </AccordionSection>
                                    </>
                ) : (
                  <>
                    <h3 className="font-semibold p-4">{group.label}</h3>
                    <div className="grid grid-cols-12 gap-x-6 gap-y-1 p-4">
                      {visibleFields.map((field) => (
                        <div
                          key={field.name}
                          className={field.cols ? colSpanMap[field.cols] : "col-span-12"}
                        >
                          {renderField(field, methods)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })} */}


              // fieldConfig.type === "array" ? (() => {
              //   const {fields, append, remove} = useFieldArray({
              //     control: form.control,
              //     name: fieldConfig.name
              //   })

              //   return(
              //     <div className="flex flex-col gap-3">
              //       {fields.map((item, index) => (
              //         <div key={item.id} className="flex gap-3 items-center bg-muted p-3 rounded-md">
              //           {fieldConfig.fields?.map(subField => (
              //             <FormField key={subField.name} control={form.control} name={`${fieldConfig.name}.${index}.${subField.name}`} render={({field}) => (
              //                 <Input {...field} placeholder={subField.placeholder} type={subField.type} className="flex-1"/>
              //               )}
              //             />
              //           ))}
              //           <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
              //             <X className="h-4 w-4"/>
              //           </Button>
              //         </div>
              //       ))}
              //       <Button type="button" onClick={() => append({})} className="w-fit">
              //         Tambah Add on
              //       </Button>
              //     </div>
              //   )
              // }
