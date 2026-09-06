import type { AppStateDefinition } from "@superego/backend";
import { codegen, valibotSchemas } from "@superego/schema";
import { appStateSchema, isJsonValue } from "@superego/shared-utils";
import { useState } from "react";
import { useController, useWatch, type Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import forms from "../../../business-logic/forms/forms.js";
import Button from "../../design-system/Button/Button.js";
import RHFTypescriptModuleField from "../RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import JsonField from "./JsonField.js";
import * as cs from "./RHFAppVersionField.css.js";

let trialSandbox:
  | import("@superego/quickjs-javascript-sandbox/browser").QuickjsJavascriptSandbox
  | undefined;
export default function StateDefinitionFields({
  control,
  name,
}: {
  control: Control;
  name: string;
}) {
  const intl = useIntl();
  const { field: stateField, fieldState: stateFieldState } = useController({
    control,
    name: `${name}.state`,
  });
  const state: AppStateDefinition = useWatch({
    control,
    name: `${name}.state`,
  });
  const [trialResult, setTrialResult] = useState<string>();
  const stateValid = v.safeParse(appStateSchema(), state.schema).success;
  return (
    <>
      <fieldset className={cs.StateDefinitionFields.fieldset}>
        {forms.utils
          .flattenError(stateFieldState.error)
          .map(({ message, path }) => (
            <p role="alert" key={`${path}:${message}`}>
              {message}
            </p>
          ))}
        <JsonField
          control={control}
          name={`${name}.state.schema`}
          label={intl.formatMessage({ defaultMessage: "State schema" })}
        />
        <JsonField
          control={control}
          name={`${name}.state.initialState`}
          label={intl.formatMessage({ defaultMessage: "Initial state" })}
        />
        <p>
          <FormattedMessage defaultMessage="Initial state is used only when state is first created. Existing saved state is preserved. File and DocumentRef types are not supported." />
        </p>
        <label>
          <input
            type="checkbox"
            checked={!!state.migration}
            onChange={(event) =>
              stateField.onChange({
                ...state,
                migration: event.target.checked
                  ? {
                      source:
                        "export default function migrate(previous: any): any { return previous; }",
                      compiled:
                        "export default function migrate(previous) { return previous; }",
                    }
                  : undefined,
              })
            }
          />
          <FormattedMessage defaultMessage="Apply an explicit state migration" />
        </label>
        {state.migration ? (
          <>
            <RHFTypescriptModuleField
              control={control}
              name={`${name}.state.migration`}
              language="typescript"
              typescriptLibs={
                stateValid
                  ? [
                      {
                        path: "/app-state.ts",
                        source: codegen(state.schema),
                      },
                    ]
                  : []
              }
            />
            <Button
              type="button"
              onPress={async () => {
                const { QuickjsJavascriptSandbox } =
                  await import("@superego/quickjs-javascript-sandbox/browser");
                const sandbox = (trialSandbox ??=
                  new QuickjsJavascriptSandbox());
                try {
                  const result = await sandbox.executeSyncFunction(
                    state.migration!,
                    [state.initialState],
                  );
                  setTrialResult(
                    result.success &&
                      stateValid &&
                      isJsonValue(result.data) &&
                      v.safeParse(
                        valibotSchemas.content(state.schema),
                        result.data,
                      ).success
                      ? JSON.stringify(result.data, null, 2)
                      : intl.formatMessage({
                          defaultMessage: "Migration trial failed",
                        }),
                  );
                } catch {
                  setTrialResult(
                    intl.formatMessage({
                      defaultMessage: "Migration trial failed",
                    }),
                  );
                }
              }}
            >
              <FormattedMessage defaultMessage="Try migration on preview initial state" />
            </Button>
            {trialResult ? <pre>{trialResult}</pre> : null}
          </>
        ) : null}
      </fieldset>
    </>
  );
}
