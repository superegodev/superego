import { AppType, type Collection } from "@superego/backend";
import { RouteName } from "@superego/routing";
import {
  defaultAppPermissions,
  emptyAppStateDefinition,
} from "@superego/shared-utils";
import { useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useCreateApp } from "../backend/hooks.js";
import forms from "../forms/forms.js";
import RHFAppVersionFilesUtils from "../forms/utils/RHFAppVersionFiles.js";
import useNavigationState from "../navigation/useNavigationState.js";
import toasts from "../toasts/toasts.js";
import ToastType from "../toasts/ToastType.js";

export default function useCreateAndEditApp() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const { mutate } = useCreateApp();
  const isCreatingRef = useRef(false);
  const [isCreating, setIsCreating] = useState(false);

  const createAndEditApp = async (targetCollections: Collection[]) => {
    if (isCreatingRef.current || targetCollections.length === 0) {
      return;
    }
    isCreatingRef.current = true;
    setIsCreating(true);
    try {
      const { success, data, error } = await mutate({
        type: AppType.CollectionView,
        name: intl.formatMessage({ defaultMessage: "New app" }),
        permissions: defaultAppPermissions,
        stateDefinition: emptyAppStateDefinition,
        targetCollectionIds: targetCollections.map(({ id }) => id),
        files: RHFAppVersionFilesUtils.fromRhfAppVersionFiles(
          forms.defaults.collectionViewAppFiles(targetCollections),
        ),
      });
      if (success) {
        navigateTo({ name: RouteName.EditApp, appId: data.id });
      } else {
        console.error(error);
        toasts.add({
          type: ToastType.Error,
          title: intl.formatMessage({ defaultMessage: "Error creating app" }),
          error,
        });
      }
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  };

  return { createAndEditApp, isCreating };
}
