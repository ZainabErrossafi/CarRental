import { useState } from "react";

export const PAGE_SIZE = 10;

export function paginate(items, requestedPage) {
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.max(1, Math.min(requestedPage, pageCount));
  const offset = (page - 1) * PAGE_SIZE;
  return {
    page,
    pageCount,
    total: items.length,
    start: items.length ? offset + 1 : 0,
    end: Math.min(offset + PAGE_SIZE, items.length),
    pageItems: items.slice(offset, offset + PAGE_SIZE),
  };
}

export default function usePagination(items, filterKey = "") {
  const [selection, setSelection] = useState({ filterKey, page: 1 });
  const pagination = paginate(items, selection.filterKey === filterKey ? selection.page : 1);

  // Reset filters immediately and keep the page valid after deleting rows.
  if (selection.filterKey !== filterKey || selection.page !== pagination.page) {
    setSelection({ filterKey, page: pagination.page });
  }

  return {
    ...pagination,
    setPage: (page) => setSelection({ filterKey, page }),
  };
}
