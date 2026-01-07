import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { AppType, type Collection } from "@superego/backend";
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
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import AppUtils from "../../../utils/AppUtils.js";
import RHFAppVersionFilesField from "../../widgets/RHFAppVersionFilesField/RHFAppVersionFilesField.js";
import * as cs from "./CreateApp.css.js";
import SetNameAndSaveModal from "./SetNameAndSaveModal.js";

interface FormValues {
  name: string;
  files: RHFAppVersionFiles;
}

interface Props {
  targetCollections: Collection[];
  isSetNameAndSaveModalOpen: boolean;
  onSetNameAndSaveModalClose: () => void;
}
export default function CreateAppForm({
  targetCollections,
  isSetNameAndSaveModalOpen,
  onSetNameAndSaveModalClose,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateApp();

  const formId = useId();
  const { control, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      files: forms.defaults.collectionViewAppFiles(targetCollections),
    },
    mode: "onSubmit",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.appName(),
        files: forms.schemas.rhfAppVersionFiles(intl),
      }),
    ),
  });

  const onSubmit = async ({ name, files }: FormValues) => {
    const { success, data } = await mutate(
      AppType.CollectionView,
      name,
      targetCollections.map(({ id }) => id),
      RHFAppVersionFilesUtils.fromRhfAppVersionFiles(files),
    );
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

  useExitWarning(
    formState.isDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      id={formId}
      className={cs.CreateAppForm.root}
    >
      <RHFAppVersionFilesField
        control={control}
        name="files"
        app={null}
        targetCollections={targetCollections}
      />
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
