export default function tiptapRichTextJsonObject() {
  // This is the default value used by TipTap itself when the editor is
  // initialized with a null value. In those cases, after the editor
  // initializes, it triggers an onUpdate with this value. Using exactly this
  // value allows to identify (and possibly filter out) that initial onUpdate.
  return {
    type: "doc",
    content: [{ type: "paragraph", attrs: { textAlign: null } }],
  };
}
