import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { AppPermissions, AppStateDefinition } from "@superego/backend";
import type { App, CollectionId } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { useMemo } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as v from "valibot";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useCreateNewAppVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import type { RHFAppVersionFiles } from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import RHFAppVersionFilesUtils from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import toasts from "../../../business-logic/toasts/toasts.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import PermissionsModal from "../../widgets/RHFAppVersionField/PermissionsModal.js";
import PersistentStateModal from "../../widgets/RHFAppVersionField/PersistentStateModal.js";
import RHFAppVersionField from "../../widgets/RHFAppVersionField/RHFAppVersionField.js";
import * as cs from "./EditApp.css.js";

interface FormValues {
  appVersion: {
    targetCollectionIds: CollectionId[];
    files: RHFAppVersionFiles;
    permissions: AppPermissions;
    stateDefinition: AppStateDefinition;
  };
}

interface Props {
  isStateModalOpen: boolean;
  onStateModalClose: () => void;
  onStateModalOpen: () => void;
  isPermissionsModalOpen: boolean;
  onPermissionsModalClose: () => void;
  onPermissionsModalOpen: () => void;
  app: App;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
}
export default function CreateNewAppVersionForm({
  isStateModalOpen,
  onStateModalClose,
  onStateModalOpen,
  isPermissionsModalOpen,
  onPermissionsModalClose,
  onPermissionsModalOpen,
  app,
  formId,
  setSubmitDisabled,
}: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();

  const { mutate } = useCreateNewAppVersion();

  const validTargetCollectionIds = useMemo(
    () => [
      ...new Set(
        app.latestVersion.targetCollections.map(({ id }) => id),
      ).intersection(new Set(collections.map(({ id }) => id))),
    ],
    [app.latestVersion.targetCollections, collections],
  );

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      appVersion: {
        targetCollectionIds: validTargetCollectionIds,
        permissions: app.latestVersion.permissions,
        stateDefinition: {
          ...app.latestVersion.stateDefinition,
          migration: null,
        },
        files: RHFAppVersionFilesUtils.toRhfAppVersionFiles(
          app.latestVersion.files,
        ),
      },
    },
    mode: "onSubmit",
    resolver: standardSchemaResolver(
      v.strictObject({
        appVersion: v.strictObject({
          permissions: forms.schemas.appPermissions(intl),
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

  const onSubmit = async ({ appVersion }: FormValues) => {
    const { success, data, error } = await mutate(
      app.id,
      app.latestVersion.id,
      appVersion.targetCollectionIds,
      RHFAppVersionFilesUtils.fromRhfAppVersionFiles(appVersion.files),
      appVersion.permissions,
      appVersion.stateDefinition,
    );
    if (success) {
      reset({
        appVersion: {
          permissions: data.latestVersion.permissions,
          stateDefinition: {
            ...data.latestVersion.stateDefinition,
            migration: null,
          },
          targetCollectionIds: data.latestVersion.targetCollections.map(
            ({ id }) => id,
          ),
          files: RHFAppVersionFilesUtils.toRhfAppVersionFiles(
            data.latestVersion.files,
          ),
        },
      });
    } else {
      console.error(error);
      toasts.add({
        type: ToastType.Error,
        title: intl.formatMessage({
          defaultMessage: "Error creating a new app version",
        }),
        error: error,
      });
    }
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit, (errors) => {
        if (errors.appVersion?.permissions) {
          onPermissionsModalOpen();
        } else if (errors.appVersion?.stateDefinition) {
          onStateModalOpen();
        }
      })}
      id={formId}
      className={cs.CreateNewAppVersionForm.root}
    >
      <FormStateEffects
        control={control}
        setSubmitDisabled={setSubmitDisabled}
        triggerExitWarningWhenDirty={true}
      />
      <PersistentStateModal
        control={control}
        name="appVersion"
        isOpen={isStateModalOpen}
        onClose={onStateModalClose}
      />
      <PermissionsModal
        control={control}
        name="appVersion.permissions"
        isOpen={isPermissionsModalOpen}
        onClose={onPermissionsModalClose}
      />
      <RHFAppVersionField
        control={control}
        name="appVersion"
        app={app}
        collections={collections}
      />
    </Form>
  );
}
