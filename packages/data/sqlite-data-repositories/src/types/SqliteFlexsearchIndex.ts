type SqliteFlexsearchIndex = {
  key: string;
  target: "document" | "conversation";
  data: string;
};
export default SqliteFlexsearchIndex;
