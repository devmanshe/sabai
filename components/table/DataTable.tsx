"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table"
import {ChevronUp, ChevronDown, Search, Plus} from "lucide-react"
import {cn} from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title: string
  description?: string
  search?: {
    value: string
    onChange: (value: string) => void
    columnId: string
    placeholder?: string
  }
  addButton?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
    disabled?: boolean
  }
  headerClassName?: string
  noDataMessage?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  description,
  search,
  addButton,
  headerClassName,
  noDataMessage = "No results.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,

    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {addButton && (
          <Button
            onClick={addButton.onClick}
            disabled={addButton.disabled}
            className="shrink-0 bg-blue"
          >
            {addButton.icon || <Plus className="mr-2 h-4 w-4"/>}
            {addButton.label}
          </Button>
        )}
      </div>

      {search && (
        <div className="flex items-center py-2 relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
          <Input
            placeholder={search.placeholder ?? "Search..."}
            value={search.value}
            onChange={(e) => {
              search.onChange(e.target.value)
              table.setGlobalFilter(e.target.value)
            }}
            className="pl-8"
          />
        </div>
      )}

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader className={cn("bg-muted/50", headerClassName)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <>
                          {header.column.getIsSorted() === "asc" && (
                            <ChevronUp className="h-4 w-4 text-muted-foreground"/>
                          )}
                          {header.column.getIsSorted() === "desc" && (
                            <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                          )}
                          {!header.column.getIsSorted() && (
                            <ChevronDown className="h-4 w-4 text-muted-foreground"/>
                          )}
                        </>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
