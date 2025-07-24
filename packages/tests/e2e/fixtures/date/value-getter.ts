import { DateCollection } from "./CollectionSchema.js";

export default function getValue(dateCollection: DateCollection): string {
  return dateCollection.date
}
