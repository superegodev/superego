export default interface I18nString {
  en: string;
  [
    /** ISO 639-1 code. */
    countryCode: string
  ]: string;
}
