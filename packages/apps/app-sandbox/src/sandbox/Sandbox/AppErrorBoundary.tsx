import { extractErrorDetails } from "@superego/shared-utils";
import { Component, type ReactNode } from "react";
import Alert from "../components/Alert/Alert.js";

interface Props {
  title: string;
  children: ReactNode;
}
type State = { hasError: false } | { hasError: true; error: any };
export default class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): State {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <Alert variant="error" title={this.props.title}>
          <pre>
            <code>
              {JSON.stringify(extractErrorDetails(this.state.error), null, 2)}
            </code>
          </pre>
        </Alert>
      );
    }

    return this.props.children;
  }
}
