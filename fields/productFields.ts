import { FormFieldGroup } from "@/type/form.type"

export const getProductFields = (
  categoryOptions: { label: string; value: string }[] = [],
  batchOptions: { label: string; value: string }[] = [],
  agencyOptions: { label: string; value: string }[] = [],
  coupleOptions: { label: string; value: string }[] = []
): FormFieldGroup[] => [
  {
    label: "Basic Info",
    fields: [
      {
        name: "name",
        label: "Product Name",
        type: "text",
        placeholder: "e.g. Sabai Merch Hoodie",
        showInModes: ["create", "edit"],
        cols: 6,
      },
      {
        name: "slug",
        label: "Slug",
        type: "text",
        placeholder: "e.g. sabai-merch-hoodie",
        showInModes: ["create", "edit"],
        cols: 6,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Product description...",
        showInModes: ["create", "edit"],
      },
    ],
  },
  {
    label: "Pricing & Stock",
    fields: [
      {
        name: "price",
        label: "Price (IDR)",
        type: "number",
        placeholder: "0",
        showInModes: ["create", "edit"],
        cols: 4,
      },
      {
        name: "stock",
        label: "Stock",
        type: "number",
        placeholder: "0",
        showInModes: ["create", "edit"],
        cols: 4,
      },
      {
        name: "weight",
        label: "Weight (gram)",
        type: "number",
        placeholder: "0",
        showInModes: ["create", "edit"],
        cols: 4,
      },
      {
        name: "min_dp_rate",
        label: "Min DP Rate (%)",
        type: "number",
        placeholder: "0–100",
        showInModes: ["create", "edit"],
        cols: 6,
      },
    ],
  },
  {
    label: "Type & Status",
    fields: [
      {
        name: "product_type",
        label: "Product Type",
        type: "select",
        options: [
          { label: "Ready Stock", value: "ready_stock" },
          { label: "Pre Order", value: "pre_order" },
        ],
        showInModes: ["create", "edit"],
        cols: 6,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Available", value: "available" },
          { label: "Sold Out", value: "sold_out" },
          { label: "Inactive", value: "inactive" },
        ],
        showInModes: ["create", "edit"],
        cols: 6,
      },
    ],
  },
  {
    label: "Relations",
    fields: [
      {
        name: "category_id",
        label: "Category",
        type: "select",
        options: categoryOptions,
        placeholder: "Select category",
        showInModes: ["create", "edit"],
        cols: 6,
      },
      {
        name: "batch_id",
        label: "Batch",
        type: "select",
        options: [
          { label: "None", value: "" },
          ...batchOptions,
        ],
        placeholder: "Select batch",
        showInModes: ["create", "edit"],
        cols: 6,
      },
      {
        name: "agency_id",
        label: "Agency",
        type: "select",
        options: [
          { label: "None", value: "" },
          ...agencyOptions,
        ],
        placeholder: "Select agency",
        showInModes: ["create", "edit"],
        cols: 6,
      },
      {
        name: "couple_id",
        label: "Couple",
        type: "select",
        options: [
          { label: "None", value: "" },
          ...coupleOptions,
        ],
        placeholder: "Select couple",
        showInModes: ["create", "edit"],
        cols: 6,
      },
    ],
  },
]
