import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type MessageId = `Message_${string}`;
const MessageIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("Message")),
) as v.GenericSchema<MessageId, MessageId>;
export default MessageIdSchema;
export type { MessageId };
