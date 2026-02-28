import type { InferenceProviderModelRef } from "@superego/backend";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import PopoverMenu from "../../../design-system/PopoverMenu/PopoverMenu.js";
import * as cs from "./ModelActionMenu.css.js";
import type ModelActionMenuItem from "./ModelActionMenuItem.js";

interface Props {
  icon: ReactNode;
  label: string;
  models: ModelActionMenuItem[];
  onModelAction: (providerModelRef: InferenceProviderModelRef) => void;
  className?: string | undefined;
  isDisabled?: boolean | undefined;
}
export default function ModelActionMenu({
  icon,
  label,
  models,
  onModelAction,
  className,
  isDisabled,
}: Props) {
  return (
    <PopoverMenu>
      <PopoverMenu.Trigger>
        <IconButton
          variant="invisible"
          label={label}
          className={className}
          isDisabled={isDisabled}
        >
          {icon}
        </IconButton>
      </PopoverMenu.Trigger>
      <PopoverMenu.Menu>
        {models.map((model) => (
          <PopoverMenu.MenuItem
            key={`${model.providerModelRef.providerName}/${model.providerModelRef.modelId}`}
            onAction={() => onModelAction(model.providerModelRef)}
          >
            <div className={cs.ModelActionMenu.menuItem}>
              <div className={cs.ModelActionMenu.modelName}>{model.label}</div>
              {"-"}
              <div className={cs.ModelActionMenu.modelDescription}>
                {model.providerLabel}{" "}
                {model.isPreviouslyUsed ? (
                  <FormattedMessage defaultMessage="(last used)" />
                ) : null}
              </div>
            </div>
          </PopoverMenu.MenuItem>
        ))}
      </PopoverMenu.Menu>
    </PopoverMenu>
  );
}
