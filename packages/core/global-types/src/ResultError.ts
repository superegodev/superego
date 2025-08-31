export default interface ResultError<Name extends string, Details = null> {
  name: Name;
  details: Details;
}
