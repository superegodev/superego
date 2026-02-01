import type PaginationItem from "./PaginationItem.js";

export default function makePaginationItems(
  totalPages: number,
  activePage: number,
): PaginationItem[] {
  const paginationItems: PaginationItem[] = [];
  const lastPage = totalPages;

  // If 7 or fewer pages, show all pages without ellipses.
  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      paginationItems.push({ type: "page", page });
    }
  }

  // More than 7 pages: always show exactly 7 items (5 pages + 2 ellipses).
  else {
    // Active page is near the start: show first 5 pages, ellipsis, last page.
    if (activePage < 5) {
      for (let page = 1; page <= 5; page += 1) {
        paginationItems.push({ type: "page", page });
      }
      paginationItems.push({ type: "ellipsis", key: "right-ellipsis" });
      paginationItems.push({ type: "page", page: lastPage });
    }

    // Active page is near the end: show first page, ellipsis, last 5 pages.
    else if (activePage > lastPage - 4) {
      paginationItems.push({ type: "page", page: 1 });
      paginationItems.push({ type: "ellipsis", key: "left-ellipsis" });
      for (let page = lastPage - 4; page <= lastPage; page += 1) {
        paginationItems.push({ type: "page", page });
      }
    }

    // Active page is in the middle: show first, ellipsis, active-1, active,
    // active+1, ellipsis, last.
    else {
      paginationItems.push({ type: "page", page: 1 });
      paginationItems.push({ type: "ellipsis", key: "left-ellipsis" });
      paginationItems.push({ type: "page", page: activePage - 1 });
      paginationItems.push({ type: "page", page: activePage });
      paginationItems.push({ type: "page", page: activePage + 1 });
      paginationItems.push({ type: "ellipsis", key: "right-ellipsis" });
      paginationItems.push({ type: "page", page: lastPage });
    }
  }

  return paginationItems;
}
