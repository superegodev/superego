import { Button, TooltipTrigger } from "react-aria-components";
import { FormattedMessage } from "react-intl";
import formatTokenCount from "../../../../utils/formatTokenCount.js";
import Tooltip from "../../../design-system/Tooltip/Tooltip.js";
import type AggregatedGenerationStats from "./AggregatedGenerationStats.js";
import * as cs from "./AssistantContentMessage.css.js";

interface Props {
  generationStats: AggregatedGenerationStats;
}
export default function TokenUsage({ generationStats }: Props) {
  const { totalTokens, inputTokens, outputTokens, cost, toolCallCount } =
    generationStats;
  if (totalTokens === 0) {
    return null;
  }
  return (
    <TooltipTrigger delay={300}>
      <Button slot={null} className={cs.TokenUsage.trigger}>
        <FormattedMessage
          defaultMessage="{totalTokens} tokens"
          values={{ totalTokens: formatTokenCount(totalTokens) }}
        />
      </Button>
      <Tooltip className={cs.TokenUsage.tooltip}>
        {toolCallCount > 0 ? (
          <p className={cs.TokenUsage.title}>
            <FormattedMessage
              defaultMessage="Message + {toolCallCount, plural, one {# tool call} other {# tool calls}}"
              values={{ toolCallCount }}
            />
          </p>
        ) : null}
        <dl className={cs.TokenUsage.statsList}>
          <dt>
            <FormattedMessage defaultMessage="Input" />
          </dt>
          <dd className={cs.TokenUsage.statsListValue}>
            {formatTokenCount(inputTokens)}
          </dd>
          <dt>
            <FormattedMessage defaultMessage="Output" />
          </dt>
          <dd className={cs.TokenUsage.statsListValue}>
            {formatTokenCount(outputTokens)}
          </dd>
          <dt>
            <FormattedMessage defaultMessage="Total" />
          </dt>
          <dd className={cs.TokenUsage.statsListValue}>
            {formatTokenCount(totalTokens)}
          </dd>
          {cost ? (
            <>
              <dt>
                <FormattedMessage defaultMessage="Cost" />
              </dt>
              <dd className={cs.TokenUsage.statsListValue}>
                {cost.toFixed(4)}
              </dd>
            </>
          ) : null}
        </dl>
      </Tooltip>
    </TooltipTrigger>
  );
}
