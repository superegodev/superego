import {
  type FileRef,
  type FileTypeDefinition,
  type RHFProtoFile,
  utils as schemaUtils,
} from "@superego/schema";
import {
  DropZone,
  FieldErrorContext,
  FileTrigger,
  Toolbar,
} from "react-aria-components";
import { type Control, useController } from "react-hook-form";
import {
  PiArrowSquareOut,
  PiDownloadSimple,
  PiUploadSimple,
} from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import useBackend from "../../../business-logic/backend/useBackend.js";
import { electronMainWorld } from "../../../business-logic/electron/electron.js";
import classnames from "../../../utils/classnames.js";
import downloadFile from "../../../utils/downloadFile.js";
import openFileWithNativeApp from "../../../utils/openFileWithNativeApp.js";
import Button from "../../design-system/Button/Button.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import FileIcon from "../../design-system/FileIcon/FileIcon.js";
import FieldError from "../../design-system/forms/FieldError.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import FileImage from "../FileImage/FileImage.js";
import RHFTextField from "../RHFTextField/RHFTextField.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";
import { useUiOptions } from "./uiOptions.js";

interface Props {
  typeDefinition: FileTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function FileField({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const backend = useBackend();
  const { field, fieldState } = useController({ control, name });
  const setFile = async (file: File) =>
    field.onChange({ name: file.name, mimeType: file.type, content: file });
  return (
    <Fieldset
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.FileField.root"
      className={classnames(
        cs.Field.root,
        isListItem && cs.ListItemField.root,
        cs.FileField.root,
      )}
      isDisclosureDisabled={true}
    >
      {!isListItem ? (
        <AnyFieldLabel
          name={field.name}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
          actions={
            !isReadOnly ? (
              <NullifyFieldAction
                isNullable={isNullable}
                field={field}
                fieldLabel={label}
              />
            ) : undefined
          }
          component="legend"
          className={cs.FileField.legend}
        />
      ) : null}
      <Fieldset.Fields className={cs.FileField.fields}>
        <DropZone
          onDrop={
            isReadOnly
              ? undefined
              : async ({ items }) => {
                  const [item] = items;
                  if (item && item.kind === "file") {
                    setFile(await item.getFile());
                  }
                }
          }
          className={cs.FileField.dropZone}
        >
          {field.value !== null && field.value.mimeType.startsWith("image/") ? (
            <FileImage
              key={`FileImage-${
                "id" in field.value
                  ? field.value.id
                  : field.value.name + field.value.mimeType
              }`}
              file={field.value}
              backend={backend}
              className={cs.FileField.imagePreview}
            />
          ) : null}
          {field.value !== null ? (
            <NonNullFileFields
              key={field.value.name + field.value.mimeType}
              control={control}
              name={name}
              file={field.value}
              setFile={setFile}
              isReadOnly={isReadOnly}
            />
          ) : (
            <NullFileFields setFile={setFile} isReadOnly={isReadOnly} />
          )}
        </DropZone>
        <FieldErrorContext
          value={{
            isInvalid: fieldState.invalid,
            validationErrors: fieldState.error?.message
              ? [fieldState.error.message]
              : [],
            validationDetails: {} as any,
          }}
        >
          <FieldError>{fieldState.error?.message}</FieldError>
        </FieldErrorContext>
      </Fieldset.Fields>
    </Fieldset>
  );
}

interface NullFileFieldsProps {
  setFile: (file: File) => void;
  isReadOnly: boolean;
}
function NullFileFields({ setFile, isReadOnly }: NullFileFieldsProps) {
  if (isReadOnly) {
    return (
      <span className={cs.FileField.nullFileFieldsFileTrigger}>
        <FormattedMessage defaultMessage="null" />
      </span>
    );
  }
  return (
    <FileTrigger
      onSelect={(files) => {
        const file = files?.item(0);
        if (file) {
          setFile(file);
        }
      }}
    >
      <Button className={cs.FileField.nullFileFieldsFileTrigger}>
        <FormattedMessage defaultMessage="null - click or drop file to upload" />
      </Button>
    </FileTrigger>
  );
}

interface NonNullFileFieldsProps {
  control: Control;
  name: string;
  file: RHFProtoFile | FileRef;
  setFile: (file: File) => void;
  isReadOnly: boolean;
}
function NonNullFileFields({
  control,
  name,
  file,
  setFile,
  isReadOnly,
}: NonNullFileFieldsProps) {
  const intl = useIntl();
  const backend = useBackend();
  const canOpenInNativeApp = electronMainWorld.isElectron;
  return (
    <div className={cs.FileField.nonNullFileFieldsRoot}>
      <div className={cs.FileField.nonNullFileIcon}>
        <FileIcon mimeType={file.mimeType} />
      </div>
      <RHFTextField
        control={control}
        name={`${name}.name`}
        ariaLabel={intl.formatMessage({ defaultMessage: "Name" })}
        isReadOnly={isReadOnly}
        className={cs.FileField.nonNullFileTextField}
      />
      <RHFTextField
        control={control}
        name={`${name}.mimeType`}
        ariaLabel={intl.formatMessage({ defaultMessage: "Mime Type" })}
        isReadOnly={isReadOnly}
        className={cs.FileField.nonNullFileTextField}
      />
      <Toolbar className={cs.FileField.nonNullFileButtons}>
        {!isReadOnly && (
          <FileTrigger
            onSelect={(files) => {
              const file = files?.item(0);
              if (file) {
                setFile(file);
              }
            }}
          >
            <IconButton
              label={intl.formatMessage({ defaultMessage: "Upload new" })}
              className={cs.FileField.nonNullFileButton}
            >
              <PiUploadSimple />
            </IconButton>
          </FileTrigger>
        )}
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Download" })}
          className={cs.FileField.nonNullFileButton}
          onPress={async () =>
            downloadFile(
              intl,
              backend,
              "id" in file
                ? file
                : await schemaUtils.RHFProtoFile.fromRHFProtoFile(file),
            )
          }
        >
          <PiDownloadSimple />
        </IconButton>
        {canOpenInNativeApp && (
          <IconButton
            label={intl.formatMessage({ defaultMessage: "Open" })}
            className={cs.FileField.nonNullFileButton}
            onPress={async () =>
              openFileWithNativeApp(
                intl,
                "id" in file
                  ? file
                  : await schemaUtils.RHFProtoFile.fromRHFProtoFile(file),
              )
            }
          >
            <PiArrowSquareOut />
          </IconButton>
        )}
      </Toolbar>
    </div>
  );
}
