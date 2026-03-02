import type { JSONContent } from "@tiptap/react";
import { lazy, type ReactNode, Suspense } from "react";
import Description from "../forms/Description.js";
import Label from "../forms/Label.js";
import * as cs from "./TiptapRichTextField.css.js";

const TiptapInput = lazy(() => import("./TiptapInput.js"));

interface Props {
  value: JSONContent | null;
  onChange: (newValue: JSONContent | null) => void;
  layout?: "vertical" | "horizontal" | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}
export default function TiptapRichTextField({
  value,
  onChange,
  layout = "vertical",
  label,
  ariaLabel,
  description,
  isDisabled,
}: Props) {
  return (
    <div
      data-disabled={isDisabled || undefined}
      className={cs.TiptapRichTextField.root[layout]}
    >
      {label ? <Label>{label}</Label> : null}
      <Suspense>
        <TiptapInput
          value={value}
          onChange={onChange}
          isDisabled={isDisabled}
          ariaLabel={ariaLabel}
        />
      </Suspense>
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}
