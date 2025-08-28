import { useState } from "react";
import { Drawer, Tabs, Button, Space, Form } from "antd";
import { WishUI } from "../../../types/wish";
import { WishForm } from "./WishForm";
import { useTranslation } from "react-i18next";

export type WishDrawerProps = {
  open: boolean;
  initialValues?: Partial<WishUI>;
  onClose: () => void;
  onSave: (values: WishUI) => void;
};

export const WishDrawer: React.FC<WishDrawerProps> = ({ open, initialValues, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const handleSubmit = async (values: WishUI) => {
    setSaving(true);
    await onSave(values);
    setSaving(false);
  };

  return (
    <Drawer
      width={520}
      open={open}
      destroyOnClose
      title={t("wish.drawer.title")}
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            {t("common.save")}
          </Button>
        </Space>
      }
    >
      <Tabs
        items={[
          {
            key: "general",
            label: t("wish.drawer.tabs.general"),
            children: (
              <WishForm
                form={form}
                initialValues={initialValues}
                onSubmit={handleSubmit}
              />
            ),
          },
        ]}
      />
    </Drawer>
  );
};
