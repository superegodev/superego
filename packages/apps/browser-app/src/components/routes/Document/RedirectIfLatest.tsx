import type { Document } from "@superego/backend";
import { RouteName } from "@superego/routing";
import { useEffect } from "react";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";

interface Props {
  document: Document;
}
export default function RedirectIfLatest({ document }: Props) {
  const { activeRoute, navigateTo } = useNavigationState();
  useEffect(() => {
    if (
      activeRoute.name === RouteName.Document &&
      activeRoute.redirectIfLatest &&
      activeRoute.documentVersionId === document.latestVersion.id
    ) {
      navigateTo(
        {
          name: RouteName.Document,
          collectionId: activeRoute.collectionId,
          documentId: activeRoute.documentId,
        },
        { stateChangeType: "replace" },
      );
    }
  }, [document, activeRoute, navigateTo]);
  return null;
}
