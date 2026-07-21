import { useQuery } from "@tanstack/react-query"
import { categoryService } from "@/services/category.service"

const CATEGORY_KEY = ["categories"]

export const useCategories = () =>
  useQuery({
    queryKey: CATEGORY_KEY,
    queryFn: categoryService.getAll,
  })
