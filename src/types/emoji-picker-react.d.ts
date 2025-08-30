declare module "emoji-picker-react" {
  import * as React from "react";
  export type EmojiClickData = { emoji: string } & Record<string, any>;
  const EmojiPicker: React.ComponentType<{
    onEmojiClick: (data: EmojiClickData, event?: MouseEvent) => void;
    skinTonesDisabled?: boolean;
    searchDisabled?: boolean;
    lazyLoadEmojis?: boolean;
    height?: number;
    width?: number;
    emojiStyle?: "native" | string;
  }>;
  export default EmojiPicker;
}

