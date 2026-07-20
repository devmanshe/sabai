import { FormFieldGroup } from "@/type/form.type"

export const agencyFields: FormFieldGroup[] = [
  {
    label: "Agency Info",
    fields: [
      {
        name: "agency_name",
        label: "Agency Name",
        type: "text",
        showInModes: ["create", "edit", "view"],
      },
      {
        name: "description",
        label: "Description",
        type: "text",
        showInModes: ["create", "edit", "view"],
      },
      {
        name: "logo_url",
        label: "Logo URL",
        type: "text",
        placeholder: "https://...",
        showInModes: ["create", "edit", "view"],
      },
    ],
  },
]