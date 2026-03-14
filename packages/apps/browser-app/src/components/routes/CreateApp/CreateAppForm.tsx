import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { AppType, type Collection, type CollectionId } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { useId } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateApp } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import type { RHFAppVersionFiles } from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import RHFAppVersionFilesUtils from "../../../business-logic/forms/utils/RHFAppVersionFiles.js";
import {
  CollectionRouteView,
  RouteName,
} from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import AppUtils from "../../../utils/AppUtils.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import RHFAppVersionField from "../../widgets/RHFAppVersionField/RHFAppVersionField.js";
import * as cs from "./CreateApp.css.js";
import SetNameAndSaveModal from "./SetNameAndSaveModal.js";

interface FormValues {
  name: string;
  appVersion: {
    targetCollectionIds: CollectionId[];
    files: RHFAppVersionFiles;
  };
}

interface Props {
  initialTargetCollections: Collection[];
  isSetNameAndSaveModalOpen: boolean;
  onSetNameAndSaveModalClose: () => void;
}
export default function CreateAppForm({
  initialTargetCollections,
  isSetNameAndSaveModalOpen,
  onSetNameAndSaveModalClose,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateApp();

  const formId = useId();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      appVersion: {
        targetCollectionIds: initialTargetCollections.map(({ id }) => id),
        files: forms.defaults.collectionViewAppFiles(initialTargetCollections),
      },
    },
    mode: "onSubmit",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.appName(),
        appVersion: v.strictObject({
          targetCollectionIds: v.pipe(
            v.array(valibotSchemas.id.collection()),
            v.minLength(1),
          ),
          files: forms.schemas.rhfAppVersionFiles(intl),
        }),
      }),
    ),
  });

  const onSubmit = async ({ name, appVersion }: FormValues) => {
    const { success, data } = await mutate({
      type: AppType.CollectionView,
      name,
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
      onSubmit={handleSubmit(onSubmit)}
      id={formId}
      className={cs.CreateAppForm.root}
    >
      <FormStateEffects control={control} triggerExitWarningWhenDirty={true} />
      <RHFAppVersionField control={control} name="appVersion" app={null} />
      <SetNameAndSaveModal
        control={control}
        formId={formId}
        result={result}
        isOpen={isSetNameAndSaveModalOpen}
        onClose={onSetNameAndSaveModalClose}
      />
    </Form>
  );
}
