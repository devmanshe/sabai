import { FormFieldGroup } from "@/type/form.type"

export const coupleFields: FormFieldGroup[] = [
  {
    label: "Couple Info",
    fields: [
      {
        name: "couple_name",
        label: "Couple Name",
        type: "text",
        showInModes: ["create", "edit", "view"],
      },
    ],
  },
]