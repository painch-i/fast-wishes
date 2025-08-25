import React, { useState } from "react";
import { Button, Drawer, Form, Input, message } from "antd";
import type { Wish } from "./types";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleReserve = () => {
    message.success(t("public.reserve.toast.reserved"));
    onClose();
  };

  const handlePropose = () => {
    message.success(t("public.reserve.toast.proposed"));
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
      extra={
        mode === "propose"
          ? null
          : (
              <Button type="link" onClick={switchToPropose}>
                {t("public.reserve.switchPropose")}
              </Button>
            )
      }
    >
      <p>{t("public.reserve.surprise")}</p>
      <Form
        layout="vertical"
        form={form}
        onFinish={mode === "reserve" ? handleReserve : handlePropose}
      >
        {mode === "reserve" && (
          <>
            <Form.Item name="name" label={t("public.reserve.labels.name")}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label={t("public.reserve.labels.email")}>
              <Input type="email" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {t("public.reserve.buttons.confirm")}
              </Button>
            </Form.Item>
          </>
        )}
        {mode === "propose" && (
          <>
            <Form.Item name="url" label={t("public.reserve.labels.url")}>
              <Input type="url" />
            </Form.Item>
            <Form.Item name="note" label={t("public.reserve.labels.note")}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {t("public.reserve.buttons.send")}
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  );
};
