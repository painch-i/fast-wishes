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
    message.success("Réservé ! Merci 🤍 On garde la surprise.");
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
      extra={mode === "propose" ? null : (
        <Button type="link" onClick={switchToPropose}>
          Je veux plutôt proposer un autre lien
        </Button>
      )}
    >
      <p>On garde la surprise 🤫</p>
      <Form
        layout="vertical"
        form={form}
        onFinish={mode === "reserve" ? handleReserve : handlePropose}
      >
        {mode === "reserve" && (
          <>
            <Form.Item name="name" label="Prénom">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input type="email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Confirmer la réservation
              </Button>
            </Form.Item>
          </>
        )}
        {mode === "propose" && (
          <>
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
          </>
        )}
      </Form>
    </Drawer>
  );
};
