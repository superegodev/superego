import type { Pack } from "@superego/backend";
import { FormattedMessage } from "react-intl";

interface Props {
  pack: Pack;
  separator: string;
}
export default function PackEntityCounts({ pack, separator }: Props) {
  return (
    <>
      {[
        pack.collectionCategories.length > 0 ? (
          <FormattedMessage
            key="categories"
            defaultMessage="{collectionCategoriesCount, plural, one {# category} other {# categories}}"
            values={{
              collectionCategoriesCount: pack.collectionCategories.length,
            }}
          />
        ) : null,
        pack.collections.length > 0 ? (
          <FormattedMessage
            key="collections"
            defaultMessage="{collectionsCount, plural, one {# collection} other {# collections}}"
            values={{
              collectionsCount: pack.collections.length,
            }}
          />
        ) : null,
        pack.apps.length > 0 ? (
          <FormattedMessage
            key="apps"
            defaultMessage="{appsCount, plural, one {# app} other {# apps}}"
            values={{ appsCount: pack.apps.length }}
          />
        ) : null,
        pack.documents.length > 0 ? (
          <FormattedMessage
            key="documents"
            defaultMessage="{documentsCount, plural, one {# document} other {# documents}}"
            values={{ documentsCount: pack.documents.length }}
          />
        ) : null,
      ]
        .filter((element) => element !== null)
        .flatMap((element, index) =>
          index > 0 ? [separator, element] : [element],
        )}
    </>
  );
}
