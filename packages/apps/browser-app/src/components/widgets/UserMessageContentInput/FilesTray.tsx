import isEmpty from "../../../utils/isEmpty.js";
import TrayFile from "./TrayFile.js";
import * as cs from "./UserMessageContentInput.css.js";

const fileTemporaryIds = new WeakMap<File, string>();

interface Props {
  files: File[];
  onRemoveFile: (index: number) => void;
  isRemoveDisabled: boolean;
}
export default function FilesTray({
  files,
  onRemoveFile,
  isRemoveDisabled,
}: Props) {
  return !isEmpty(files) ? (
    <div className={cs.FilesTray.root}>
      {files.map((file, index) => {
        const fileId = fileTemporaryIds.get(file) ?? crypto.randomUUID();
        fileTemporaryIds.set(file, fileId);
        return (
          <TrayFile
            key={fileId}
            file={file}
            onRemove={() => onRemoveFile(index)}
            isRemoveDisabled={isRemoveDisabled}
          />
        );
      })}
    </div>
  ) : null;
}
