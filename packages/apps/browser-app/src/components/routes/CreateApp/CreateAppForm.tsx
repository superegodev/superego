import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { AppStateDefinition } from "@superego/backend";
import { AppType, type Collection, type CollectionId } from "@superego/backend";
import { CollectionRouteView, RouteName } from "@superego/routing";
import {
  emptyAppStateDefinition,
  defaultAppPermissions,
  valibotSchemas,
} from "@superego/shared-utils";
import { useId } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateApp } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import type { RHFAppPermissions } from "../../../business-logic/forms/utils/RHFAppPermissions.js";
import RHFAppPermissionsUtils from "../../../business-logic/forms/utils/RHFAppPermissions.js";
import type { RHFAppVersionFiles } from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import RHFAppVersionFilesUtils from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import AppUtils from "../../../utils/AppUtils.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import PersistentStateModal from "../../widgets/RHFAppVersionField/PersistentStateModal.js";
import RHFAppVersionField from "../../widgets/RHFAppVersionField/RHFAppVersionField.js";
import * as cs from "./CreateApp.css.js";
import SetSettingsAndCreateModal from "./SetSettingsAndCreateModal.js";

interface FormValues {
  name: string;
  permissions: RHFAppPermissions;
  appVersion: {
    targetCollectionIds: CollectionId[];
    files: RHFAppVersionFiles;
    stateDefinition: AppStateDefinition;
  };
}

interface Props {
  isStateModalOpen: boolean;
  onStateModalClose: () => void;
  onStateModalOpen: () => void;
  collections: Collection[];
  initialTargetCollections: Collection[];
  isSetSettingsAndCreateModalOpen: boolean;
  onSetSettingsAndCreateModalClose: () => void;
}
export default function CreateAppForm({
  isStateModalOpen,
  onStateModalClose,
  onStateModalOpen,
  collections,
  initialTargetCollections,
  isSetSettingsAndCreateModalOpen,
  onSetSettingsAndCreateModalClose,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateApp();

  const formId = useId();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      permissions: RHFAppPermissionsUtils.toRhfAppPermissions(
        defaultAppPermissions,
      ),
      appVersion: {
        stateDefinition: emptyAppStateDefinition,
        targetCollectionIds: initialTargetCollections.map(({ id }) => id),
        files: forms.defaults.collectionViewAppFiles(initialTargetCollections),
      },
    },
    mode: "onSubmit",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.appName(),
        permissions: forms.schemas.rhfAppPermissions(intl),
        appVersion: v.strictObject({
          stateDefinition: forms.schemas.appStateDefinition(intl),
          targetCollectionIds: v.pipe(
            v.array(valibotSchemas.id.collection()),
            v.minLength(1),
          ),
          files: forms.schemas.rhfAppVersionFiles(intl),
        }),
      }),
    ),
  });

  const onSubmit = async ({ name, permissions, appVersion }: FormValues) => {
    const { success, data } = await mutate({
      type: AppType.CollectionView,
      name,
      permissions: RHFAppPermissionsUtils.fromRhfAppPermissions(permissions),
      stateDefinition: appVersion.stateDefinition,
      targetCollectionIds: appVersion.targetCollectionIds,
      files: RHFAppVersionFilesUtils.fromRhfAppVersionFiles(appVersion.files),
    });
    if (success) {
      const firstTargetedCollectionId =
        AppUtils.getFirstTargetCollectionId(data);
      navigateTo(
        firstTargetedCollectionId
          ? {
              name: RouteName.Collection,
              collectionId: firstTargetedCollectionId,
              view: CollectionRouteView.App,
              appId: data.id,
            }
          : { name: RouteName.Ask },
        { ignoreExitWarning: true },
      );
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        if (errors.name || errors.permissions) {
          return;
        }
        if (errors.appVersion?.stateDefinition) {
          onSetSettingsAndCreateModalClose();
          onStateModalOpen();
        }
      })}
      id={formId}
      className={cs.CreateAppForm.root}
    >
      <FormStateEffects control={control} triggerExitWarningWhenDirty={true} />
      <PersistentStateModal
        control={control}
        name="appVersion"
        isOpen={isStateModalOpen}
        onClose={onStateModalClose}
      />
      <RHFAppVersionField
        control={control}
        name="appVersion"
        app={null}
        collections={collections}
      />
      <SetSettingsAndCreateModal
        control={control}
        formId={formId}
        result={result}
        isOpen={isSetSettingsAndCreateModalOpen}
        onClose={onSetSettingsAndCreateModalClose}
      />
    </Form>
  );
}
