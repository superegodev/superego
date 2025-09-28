export default interface ContentSummaryProperty {
  name: string;
  label: string;
  position: number;
  sortable: boolean;
  defaultSort: "asc" | "desc" | null;
}
