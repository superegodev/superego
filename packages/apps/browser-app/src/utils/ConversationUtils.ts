import type { Conversation } from "@superego/backend";

const DISPLAY_NAME_LENGTH = 16;

export default {
  getDisplayName({ title }: Conversation): string {
    const segments = [
      ...new Intl.Segmenter(undefined, { granularity: "word" }).segment(title),
    ];
    console.log(segments);
    return segments.length > DISPLAY_NAME_LENGTH
      ? `${segments
          .slice(0, DISPLAY_NAME_LENGTH)
          .map(({ segment }) => segment)
          .join("")}…`
      : title;
  },
};
