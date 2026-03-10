import "@excalidraw/excalidraw/index.css";
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { Theme } from "@superego/backend";
import debounce from "debounce";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import { useLocale } from "react-aria-components";
import { PiArrowsIn, PiArrowsOut } from "react-icons/pi";
import { useIntl } from "react-intl";
import useTheme from "../../../business-logic/theme/useTheme.js";
import { EXCALIDRAW_INPUT_ON_CHANGE_DEBOUNCE } from "../../../config.js";
import classnames from "../../../utils/classnames.js";
import * as cs from "./ExcalidrawInput.css.js";
import type Props from "./Props.js";

// This input component wraps the Excalidraw editor, which manages its own
// internal state. The `value` prop is used both for the initial value and for
// ongoing synchronization (e.g., when the form resets after an external change,
// or when the nullify button sets it to `null`).
//
// Because `onChange` is debounced, there is a window where the editor's
// internal state is ahead of the form value. If the form refreshes the `value`
// prop during this window (e.g., after an auto-save), the component would
// overwrite the user's in-flight edits with the stale saved value.
//
// To prevent this, the component tracks whether it has "pending local changes"
// — changes that exist in the editor but have not yet been flushed to
// `onChange`. While pending local changes exist, incoming `value` prop updates
// are ignored — except for `null`, which is always accepted (for the nullify
// button).
export default function EagerExcalidrawInput({
  value,
  onChange,
  onBlur,
  autoFocus,
  isInvalid = false,
  isReadOnly = false,
  ref,
  className,
}: Props) {
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(autoFocus);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI>(null);
  const previousSerializedRef = useRef<string | null>(null);
  const hasPendingLocalChangesRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const theme = useTheme();
  const { locale } = useLocale();
  const langCode = locale.split("-")[0];
  const intl = useIntl();

  useEffect(() => {
    if (rootRef.current && ref) {
      ref({
        focus: () => {
          rootRef.current?.focus();
        },
      });
    }
  }, [ref]);

  // All dependencies are accessed via refs, so this callback is stable.
  const flushScene = useCallback(() => {
    const excalidrawApi = excalidrawApiRef.current;
    if (!excalidrawApi) {
      return;
    }
    const elements = excalidrawApi
      .getSceneElements()
      // Excalidraw bug: the editor creates elements with boundElements = null.
      // However, when the scene is loaded into the editor the first time,
      // elements with boundElements = null are converted to boundElements = [],
      // which causes an unwanted change in the json (which in turn triggers a
      // save for a new document version, which is undesired, since there's no
      // functional difference).
      // Solution: make the conversion on export.
      .map((element) =>
        element.boundElements ? element : { ...element, boundElements: [] },
      );
    const files = excalidrawApi.getFiles();
    const { scrollX, scrollY, zoom } = excalidrawApi.getAppState();
    const appState = { scrollX, scrollY, zoom: { value: zoom.value } };
    const serialized = JSON.stringify({ elements, files, appState });
    hasPendingLocalChangesRef.current = false;
    if (serialized !== previousSerializedRef.current) {
      previousSerializedRef.current = serialized;
      onChangeRef.current(JSON.parse(serialized));
    }
  }, []);

  const debouncedFlushScene = useMemo(
    () => debounce(flushScene, EXCALIDRAW_INPUT_ON_CHANGE_DEBOUNCE),
    [flushScene],
  );

  useEffect(() => () => debouncedFlushScene.clear(), [debouncedFlushScene]);

  // Stable callback with no dependencies to avoid Excalidraw re-render loops.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  const handleExcalidrawChange = useCallback(() => {
    hasPendingLocalChangesRef.current = true;
    debouncedFlushScene();
  }, []);

  useEffect(() => {
    if (hasFocus) {
      excalidrawApiRef.current?.refresh();
    }
  }, [hasFocus]);

  useEffect(() => {
    const excalidrawApi = excalidrawApiRef.current;
    if (!excalidrawApi) {
      return;
    }
    if (!value) {
      debouncedFlushScene.clear();
      hasPendingLocalChangesRef.current = false;
      previousSerializedRef.current = null;
      excalidrawApi.resetScene();
      return;
    }
    if (hasPendingLocalChangesRef.current) {
      return;
    }
    const serialized = JSON.stringify(value);
    if (serialized === previousSerializedRef.current) {
      return;
    }
    previousSerializedRef.current = serialized;
    excalidrawApi.updateScene({
      elements: value.elements,
      appState: value.appState as any,
    });
    if (value.files) {
      excalidrawApi.addFiles(Object.values(value.files) as any[]);
    }
  }, [value, debouncedFlushScene]);
  const viewModeEnabled = isReadOnly || !hasFocus;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={classnames(cs.ExcalidrawInput.root, className)}
      aria-invalid={isInvalid}
      data-has-focus={hasFocus}
      data-focus-visible={hasFocus && isFocusVisible}
      data-read-only={isReadOnly}
      data-full-screen={isFullScreen}
      onFocus={() => setHasFocus(true)}
      onBlur={(evt) => {
        const focusPassedToChild = rootRef.current?.contains(evt.relatedTarget);
        if (!focusPassedToChild) {
          debouncedFlushScene.clear();
          flushScene();
          setHasFocus(false);
          onBlur?.();
        }
      }}
    >
      <Excalidraw
        excalidrawAPI={(excalidrawApi) => {
          excalidrawApiRef.current = excalidrawApi;
        }}
        initialData={value as ExcalidrawInitialDataState}
        onChange={handleExcalidrawChange}
        viewModeEnabled={viewModeEnabled}
        autoFocus={autoFocus}
        langCode={langCode}
        theme={theme === Theme.Light ? "light" : "dark"}
        renderTopRightUI={() =>
          !viewModeEnabled ? (
            <button
              type="button"
              className={cs.ExcalidrawInput.fullScreenButton}
              aria-pressed={isFullScreen}
              aria-label={
                isFullScreen
                  ? intl.formatMessage({ defaultMessage: "Exit full screen" })
                  : intl.formatMessage({ defaultMessage: "Enter full screen" })
              }
              onClick={() => setIsFullScreen((isFullScreen) => !isFullScreen)}
            >
              {isFullScreen ? <PiArrowsIn /> : <PiArrowsOut />}
            </button>
          ) : null
        }
      >
        <MainMenu>
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.SearchMenu />
          <MainMenu.DefaultItems.ClearCanvas />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}
