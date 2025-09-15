import { useState } from "react";
import { PiCheck, PiCopy } from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import type Milliseconds from "../../../utils/Milliseconds.js";
import Button from "../Button/Button.js";
import * as cs from "./CodeBlock.css.js";

const WAS_COPIED_TIMEOUT: Milliseconds = 3_000;

interface Props {
  code: string;
}
export default function CopyButton({ code }: Props) {
  const [wasCopied, setWasCopied] = useState(false);
  return (
    <Button
      variant="invisible"
      onPress={async () => {
        await navigator.clipboard.writeText(code);
        setWasCopied(true);
        setTimeout(() => setWasCopied(false), WAS_COPIED_TIMEOUT);
      }}
      className={cs.CopyButton.root}
    >
      {wasCopied ? (
        <>
          <PiCheck />
          <FormattedMessage defaultMessage="Copied" />
        </>
      ) : (
        <>
          <PiCopy />
          <FormattedMessage defaultMessage="Copy" />
        </>
      )}
    </Button>
  );
}
