type PaginationItem =
  | { type: "page"; page: number }
  | { type: "ellipsis"; key: string };
export default PaginationItem;
