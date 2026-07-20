"use client";

import { Ellipsis, Eye, Pencil, Trash, Trash2 } from "lucide-react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
    onView?: (row: TData) => void
    onEdit?: (row: TData) => void
    onDelete?: (row: TData) => void
}

export function DataTableRowActions<TData>({
  row, onView, onEdit, onDelete,
}: DataTableRowActionsProps<TData>) {
  const data = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <Ellipsis className="h-4 w-4" />
          <span className="sr-only">Buka menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {onView && (
            <DropdownMenuItem onClick={() => onView(data)}>
                <Eye className="w-4 h-4 text-yellow-700"/>
                View Detail
            </DropdownMenuItem>
        )}
        {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(data)}>
                <Pencil className="w-4 h-4 text-green-700"/>
                Edit
            </DropdownMenuItem>
        )}
        {onDelete && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(data)}>
                    <Trash2 className="w-4 h-4 text-red-900"/>
                    Delete
                </DropdownMenuItem>
            </>

        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}