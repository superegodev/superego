import "@excalidraw/excalidraw/index.css";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Theme } from "@superego/backend";
import { useEffect, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import { useLocale } from "react-aria-components";
import useTheme from "../../../business-logic/theme/useTheme.js";
import { EXCALIDRAW_INPUT_ON_CHANGE_CHECK_INTERVAL } from "../../../config.js";
import * as cs from "./ExcalidrawInput.css.js";
import type Props from "./Props.js";

// The Excalidraw component is uncontrolled: changing `initialData` after first
// render has no effect. More importantly, passing an `onChange` prop triggers a
// re-render on every call, and every render fires a new change event, causing
// infinite loops. To work around this, we avoid `onChange` entirely and instead
// poll the imperative API (`getSceneElements` / `getFiles`) on an interval,
// only notifying the parent when the serialized data actually changed. The
// interval is active only while the component has focus.
export default function EagerExcalidrawInput({
  value,
  onChange,
  onBlur,
  autoFocus,
  isInvalid = false,
  isReadOnly = false,
  ref,
}: Props) {
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(autoFocus);
  const rootRef = useRef<HTMLDivElement>(null);
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI>(null);
  const previousSerializedRef = useRef<string | null>(null);
  const theme = useTheme();
  const { locale } = useLocale();
  const langCode = locale.split("-")[0];

  useEffect(() => {
    if (rootRef.current && ref) {
      ref({
        focus: () => {
          rootRef.current?.focus();
        },
      });
    }
  }, [ref]);

  useEffect(() => {
    if (!hasFocus) {
      return;
    }
    const intervalId = setInterval(() => {
      const excalidrawApi = excalidrawApiRef.current;
      if (!excalidrawApi) {
        return;
      }
      const elements = excalidrawApi.getSceneElements();
      const files = excalidrawApi.getFiles();
      const serialized = JSON.stringify({ elements, files });
      if (serialized !== previousSerializedRef.current) {
        previousSerializedRef.current = serialized;
        onChange(JSON.parse(serialized));
      }
    }, EXCALIDRAW_INPUT_ON_CHANGE_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [hasFocus, onChange]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={cs.ExcalidrawInput.root}
      aria-invalid={isInvalid}
      data-has-focus={hasFocus}
      data-focus-visible={hasFocus && isFocusVisible}
      data-read-only={isReadOnly}
      onFocus={() => setHasFocus(true)}
      onBlur={(evt) => {
        const focusPassedToChild = rootRef.current?.contains(evt.relatedTarget);
        if (!focusPassedToChild) {
          setHasFocus(false);
          onBlur?.();
        }
      }}
    >
      <Excalidraw
        excalidrawAPI={(excalidrawApi) => {
          excalidrawApiRef.current = excalidrawApi;
        }}
        initialData={value}
        viewModeEnabled={isReadOnly || !hasFocus}
        autoFocus={autoFocus}
        langCode={langCode}
        theme={theme === Theme.Light ? "light" : "dark"}
      >
        <MainMenu>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}
