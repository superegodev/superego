import { extractErrorDetails } from "@superego/shared-utils";
import Alert from "../components/Alert/Alert.js";

interface Props {
  title: string;
  error: any;
}
export default function AppImportingError({ title, error }: Props) {
  return (
    <Alert variant="error" title={title}>
      <pre>
        <code>{JSON.stringify(extractErrorDetails(error), null, 2)}</code>
      </pre>
    </Alert>
  );
}
