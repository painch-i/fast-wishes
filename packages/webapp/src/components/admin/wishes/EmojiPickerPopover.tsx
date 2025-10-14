import { Button, Popover } from "antd";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import React, { useState } from "react";

export type EmojiPickerPopoverProps = {
  value?: string | null;
  onChange: (emoji: string | null) => void;
  buttonSize?: number;
};

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({ value, onChange, buttonSize = 48 }) => {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (data: EmojiClickData) => {
    onChange(data?.emoji || null);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomLeft"
      getPopupContainer={() => document.body}
      content={
        <div style={{ width: 320 }}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            skinTonesDisabled
            lazyLoadEmojis
            height={360}
            width={300}
            emojiStyle="native"
          />
          <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6 }}>
            <Button size="small" onClick={() => { onChange(null); setOpen(false); }} aria-label="Clear emoji">
              ×
            </Button>
          </div>
        </div>
      }
    >
      <Button size="large" style={{ width: buttonSize }} aria-label="Emoji">
        {value || "🎁"}
      </Button>
    </Popover>
  );
};
