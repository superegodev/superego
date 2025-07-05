import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type {
  NonEmptyArray,
  SummaryPropertyDefinition,
} from "@superego/backend";
import {
  codegen,
  DataType,
  type Schema,
  valibotSchemas as schemaValibotSchemas,
} from "@superego/schema";
import { valibotSchemas as backendUtilsValibotSchemas } from "@superego/shared-utils";
import { useEffect, useMemo, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateCollection } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Alert from "../../design-system/Alert/Alert.js";
import RpcError from "../../design-system/RpcError/RpcError.js";
import RHFEmojiField from "../../widgets/RHFEmojiField/RHFEmojiField.js";
import RHFSchemaField from "../../widgets/RHFSchemaField/RHFSchemaField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFSummaryPropertyDefinitionsField from "../../widgets/RHFSummaryPropertyDefinitionsField/RHFSummaryPropertyDefinitionsField.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./CreateCollection.css.js";

const schemaTypescriptLibPath = "/CollectionSchema.ts";

interface FormValues {
  name: string;
  icon: string | null;
  schema: Schema;
  summaryProperties: NonEmptyArray<SummaryPropertyDefinition>;
}

const defaultSchema: Schema = {
  types: { MyType: { dataType: DataType.Struct, properties: {} } },
  rootType: "MyType",
};

export default function CreateCollectionForm() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateCollection();

  const defaultSummaryPropertyDefinition = useMemo(
    () =>
      forms.defaults.summaryPropertyDefinition(
        0,
        defaultSchema,
        schemaTypescriptLibPath,
        intl,
      ),
    [intl],
  );
  const defaultGetterRef = useRef(defaultSummaryPropertyDefinition.getter);
  const { control, handleSubmit, setValue, getValues, watch } =
    useForm<FormValues>({
      defaultValues: {
        name: "",
        icon: null,
        schema: defaultSchema,
        summaryProperties: [defaultSummaryPropertyDefinition],
      },
      mode: "onSubmit",
      resolver: standardSchemaResolver(
        v.strictObject({
          name: backendUtilsValibotSchemas.collectionName(),
          icon: v.nullable(backendUtilsValibotSchemas.icon()),
          schema: schemaValibotSchemas.schema(),
          summaryProperties: forms.schemas.summaryPropertyDefinitions(intl),
        }),
      ),
    });
  const schema = watch("schema");

  // When schema changes, for each summary property, if the user didn't make any
  // change to the getter (hence it's still the default one), update it.
  useEffect(() => {
    if (typeof schema === "string") {
      return;
    }
    const newDefaultGetter = forms.defaults.summaryPropertyDefinitionGetter(
      schema,
      schemaTypescriptLibPath,
    );
    getValues("summaryProperties").forEach(({ getter }, index) => {
      if (getter.source === defaultGetterRef.current.source) {
        setValue(`summaryProperties.${index}.getter`, newDefaultGetter);
      }
    });
    defaultGetterRef.current = newDefaultGetter;
  }, [schema, getValues, setValue]);

  const onSubmit = async ({
    schema,
    name,
    icon,
    summaryProperties,
  }: FormValues) => {
    const { success, data } = await mutate(
      { name, icon, collectionCategoryId: null },
      schema,
      { summaryProperties },
    );
    if (success) {
      navigateTo({ name: RouteName.Collection, collectionId: data.id });
    }
  };

  const schemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? ({ path: schemaTypescriptLibPath, source: codegen(schema) } as const)
        : null,
    [schema],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className={cs.CreateCollectionForm.nameIconInputs}>
        <RHFEmojiField
          control={control}
          name="icon"
          label={intl.formatMessage({ defaultMessage: "Icon" })}
        />
        <RHFTextField
          control={control}
          name="name"
          label={intl.formatMessage({ defaultMessage: "Name" })}
          autoFocus={true}
          className={cs.CreateCollectionForm.nameInput}
        />
      </div>
      <RHFSchemaField
        control={control}
        name="schema"
        label={intl.formatMessage({ defaultMessage: "Schema" })}
        className={cs.CreateCollectionForm.schemaTextField}
      />
      <RHFSummaryPropertyDefinitionsField
        control={control}
        name="summaryProperties"
        isDisabled={typeof schema === "string"}
        schemaTypescriptLib={schemaTypescriptLib}
        getDefaultSummaryPropertyDefinition={(index) =>
          forms.defaults.summaryPropertyDefinition(
            index,
            schema,
            schemaTypescriptLibPath,
            intl,
          )
        }
      />
      <div className={cs.CreateCollectionForm.submitButtonContainer}>
        <RHFSubmitButton
          control={control}
          variant="primary"
          disableOnNotDirty={false}
        >
          <FormattedMessage defaultMessage="Create" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error creating collection",
          })}
        >
          <RpcError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}
