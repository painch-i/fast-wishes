import React, { useState } from "react";
import { Button, Drawer, Form, Input, message } from "antd";
import type { Wish } from "./types";
import "./ReserveBottomSheet.css";

interface ReserveBottomSheetProps {
  open: boolean;
  wish: Wish | null;
  onClose: () => void;
}

export const ReserveBottomSheet: React.FC<ReserveBottomSheetProps> = ({
  open,
  wish,
  onClose,
}) => {
  const [mode, setMode] = useState<"reserve" | "propose">("reserve");
  const [form] = Form.useForm();

  const handleReserve = () => {
    message.success("Réservé ! Merci 💝");
    onClose();
  };

  const handlePropose = () => {
    message.success("Lien envoyé, merci !");
    onClose();
  };

  const switchToPropose = () => setMode("propose");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      destroyOnClose
      title={wish?.name}
    >
      {wish && (
        <div className="sheet-content">
          <div className="sheet-thumb">
            {wish.image ? (
              <img src={wish.image} alt="" />
            ) : (
              <span className="placeholder">{wish.name.charAt(0)}</span>
            )}
          </div>
          {wish.price && <div className="sheet-price">{wish.price}</div>}
          {wish.url && (
            <a
              href={wish.url}
              className="sheet-domain"
              target="_blank"
              rel="noopener noreferrer"
            >
              {new URL(wish.url).hostname.replace(/^www\./, "")}
            </a>
          )}
          {wish.description && <p>{wish.description}</p>}
        </div>
      )}
      {mode === "reserve" && (
        <>
          <Button type="primary" block onClick={handleReserve}>
            Réserver
          </Button>
          <Button type="link" block onClick={switchToPropose}>
            Proposer un autre lien
          </Button>
          <p className="sheet-caption">On garde la surprise 🤫</p>
        </>
      )}
      {mode === "propose" && (
        <Form layout="vertical" form={form} onFinish={handlePropose}>
          <Form.Item name="url" label="Lien">
            <Input type="url" />
          </Form.Item>
          <Form.Item name="note" label="Note">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Envoyer
            </Button>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
};
