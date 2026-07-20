import { FormFieldGroup } from "@/type/form.type";

export const registerGroup: FormFieldGroup[] = [
        {
        label: "Name",
        fields: [
            {
                name: "username",
                label: "Username",
                type: "text",
                showInModes: ["create", "edit", "view"]
            },
            {
                name: "name",
                label: "Name",
                type: "text",
                showInModes: ["create", "edit", "view"]
            },
        ]
    },
    {
        label: "Contact",
        fields: [
            {
                name: "phone",
                label: "Phone Number",
                type: "number",
                showInModes: ["create", "edit", "view"]
            },
            {
                name: "email",
                label: "Email",
                type: "text",
                showInModes: ["create", "edit", "view"]
            },
            {
                name: "password",
                label: "Password",
                type: "password",
                placeholder: "Use 8 or more characters with a mix of letters and numbers.",
                showInModes: ["create", "edit", "view"]
            },
            {
                name: "confirm",
                label: "Confirm Password",
                type: "password",
                showInModes: ["create", "edit", "view"]
            },
        ]
    },
]

export const loginGroup: FormFieldGroup[] = [
        {
        label: "",
        fields: [
            {
                name: "email",
                label: "Username",
                type: "text",
                showInModes: ["create", "edit", "view"]
            },
            {
                name: "password",
                label: "Password",
                type: "password",
                showInModes: ["create", "edit", "view"]
            },
        ]
    },
]