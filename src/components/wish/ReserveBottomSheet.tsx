import React, { useState } from "react";
import { Button, Drawer, Form, Input, message } from "antd";
import type { Wish } from "./types";

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

  const domain = wish?.url
    ? new URL(wish.url).hostname.replace(/^www\./, "")
    : "";

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
          {wish.image && (
            <img src={wish.image} alt="" style={{ width: 64, borderRadius: 12 }} />
          )}
          {wish.price && <p style={{ fontWeight: 600 }}>{wish.price}</p>}
          {domain && (
            <a href={wish.url ?? "#"} target="_blank" rel="noreferrer">
              {domain}
            </a>
          )}
          {wish.description && <p>{wish.description}</p>}
        </div>
      )}

      {mode === "reserve" ? (
        <>
          <Button type="primary" block onClick={handleReserve}>
            Réserver
          </Button>
          <Button type="link" block onClick={() => setMode("propose")}
            >
            Proposer un autre lien
          </Button>
          <p style={{ marginTop: 8 }}>On garde la surprise 🤫</p>
        </>
      ) : (
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
