import type { Milliseconds } from "@superego/global-types";
import { useState } from "react";
import { PiCheck, PiCopy } from "react-icons/pi";
import Button from "../Button/Button.js";

const WAS_COPIED_TIMEOUT: Milliseconds = 3_000;

interface Props {
  text: string;
  className?: string | undefined;
}
export default function CopyButton({ text, className }: Props) {
  const [wasCopied, setWasCopied] = useState(false);
  return (
    <Button
      variant="invisible"
      onPress={async () => {
        await navigator.clipboard.writeText(text);
        setWasCopied(true);
        setTimeout(() => setWasCopied(false), WAS_COPIED_TIMEOUT);
      }}
      className={className}
    >
      {wasCopied ? <PiCheck /> : <PiCopy />}
    </Button>
  );
}
