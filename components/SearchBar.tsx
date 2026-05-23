"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  basePath?: string;
  preserveParams?: boolean;
}

export default function SearchBar({
  placeholder = "Search Sabai Merch",
  defaultValue = "",
  basePath,
  preserveParams
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = preserveParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    const target = basePath ?? pathname;
    const query = params.toString();
    router.push(query ? `${target}?${query}` : target);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="input-field flex-1"
      />
      <button type="submit" className="btn-primary">
        Search
      </button>
    </form>
  );
}
