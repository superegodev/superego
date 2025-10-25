import type AppComponentProps from "../../../types/AppComponentProps.js";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import Text from "../Text/Text.js";
import * as cs from "./DefaultApp.css.js";

export default function DefaultApp({ collections }: AppComponentProps) {
  const { name, infoLine1, infoLine2, infoLine3, collectionInfo } =
    useIntlMessages("DefaultApp");
  return (
    <div className={cs.DefaultApp.root}>
      <Text element="h2">{name}</Text>
      <Text element="p">{infoLine1}</Text>
      <Text element="p">
        {infoLine2}
        {"\u2002👇"}
      </Text>
      <Text element="p">
        {infoLine3}
        {"\u2002"}
        <span style={{ display: "inline-block", transform: "rotate(45deg)" }}>
          {"👆"}
        </span>
      </Text>
      <Text element="p">{collectionInfo}</Text>
      <ul>
        {Object.values(collections).map((collection) => (
          <li key={collection.id}>{collection.displayName}</li>
        ))}
      </ul>
    </div>
  );
}
