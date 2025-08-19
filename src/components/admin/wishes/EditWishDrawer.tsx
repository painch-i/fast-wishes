import { useState } from "react";
import { Button, Drawer, Form, Space, Typography } from "antd";
import { WishUI } from "../../../types/wish";
import { WishForm } from "./WishForm";

export type EditWishDrawerProps = {
  open: boolean;
  initialValues?: Partial<WishUI>;
  onClose: () => void;
  onSave: (values: WishUI) => Promise<void> | void;
};

export const EditWishDrawer: React.FC<EditWishDrawerProps> = ({
  open,
  initialValues,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm<WishUI>();
  const [saving, setSaving] = useState(false);

  const submit = async (values: WishUI) => {
    setSaving(true);
    try {
      await onSave(values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      width={520}
      open={open}
      destroyOnClose
      onClose={onClose}
      title={
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Éditer le souhait
          </Typography.Title>
          <Typography.Text type="secondary">
            Modifie les informations de ton souhait
          </Typography.Text>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            type="primary"
            loading={saving}
            onClick={() => form.submit()}
          >
            Enregistrer
          </Button>
        </Space>
      }
    >
      <WishForm form={form} initialValues={initialValues} onSubmit={submit} />
    </Drawer>
  );
};
