import type { FileRef, FileTypeDefinition, ProtoFile } from "@superego/schema";
import {
  DropZone,
  FieldErrorContext,
  FileTrigger,
  Toolbar,
} from "react-aria-components";
import { type Control, useController } from "react-hook-form";
import { PiDownloadSimple, PiUploadSimple } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import useBackend from "../../../business-logic/backend/useBackend.js";
import classnames from "../../../utils/classnames.js";
import downloadFile from "../../../utils/downloadFile.js";
import Button from "../../design-system/Button/Button.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import FileIcon from "../../design-system/FileIcon/FileIcon.js";
import FieldError from "../../design-system/forms/FieldError.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import RHFTextField from "../RHFTextField/RHFTextField.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import { useDocument } from "./document.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";

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
  const { field, fieldState } = useController({ control, name });
  const setFile = async (file: File) =>
    field.onChange({
      name: file.name,
      mimeType: file.type,
      content: new Uint8Array(await file.arrayBuffer()),
    });
  return (
    <Fieldset
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={classnames(
        cs.Field.root,
        isListItem && cs.ListItemField.root,
        cs.FileField.root,
      )}
      isDisclosureDisabled={true}
    >
      {!isListItem ? (
        <AnyFieldLabel
          component="legend"
          className={cs.FileField.legend}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
          actions={
            <NullifyFieldAction
              isNullable={isNullable}
              field={field}
              fieldLabel={label}
            />
          }
        />
      ) : null}
      <Fieldset.Fields className={cs.FileField.fields}>
        <DropZone
          className={cs.FileField.dropZone}
          onDrop={async ({ items }) => {
            const [item] = items;
            if (item && item.kind === "file") {
              setFile(await item.getFile());
            }
          }}
        >
          {field.value !== null ? (
            <NonNullFileFields
              control={control}
              name={name}
              file={field.value}
              setFile={setFile}
            />
          ) : (
            <NullFileFields setFile={setFile} />
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
}
function NullFileFields({ setFile }: NullFileFieldsProps) {
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
  file: ProtoFile | FileRef;
  setFile: (file: File) => void;
}
function NonNullFileFields({
  control,
  name,
  file,
  setFile,
}: NonNullFileFieldsProps) {
  const intl = useIntl();
  const backend = useBackend();
  const document = useDocument();
  return (
    <div className={cs.FileField.nonNullFileFieldsRoot}>
      <div className={cs.FileField.nonNullFileIcon}>
        <FileIcon mimeType={file.mimeType} />
      </div>
      <RHFTextField
        control={control}
        name={`${name}.name`}
        ariaLabel={intl.formatMessage({ defaultMessage: "Name" })}
        className={cs.FileField.nonNullFileTextField}
      />
      <RHFTextField
        control={control}
        name={`${name}.mimeType`}
        ariaLabel={intl.formatMessage({ defaultMessage: "Mime Type" })}
        className={cs.FileField.nonNullFileTextField}
      />
      <Toolbar className={cs.FileField.nonNullFileButtons}>
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
        <IconButton
          label={intl.formatMessage({ defaultMessage: "Download" })}
          className={cs.FileField.nonNullFileButton}
          onPress={() =>
            downloadFile(backend, file, document?.collectionId, document?.id)
          }
        >
          <PiDownloadSimple />
        </IconButton>
      </Toolbar>
    </div>
  );
}
