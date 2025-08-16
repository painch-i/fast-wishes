import { useState } from "react";
import { Drawer, Tabs, Button, Space, Form } from "antd";
import { WishUI } from "../../../types/wish";
import { WishForm } from "./WishForm";

export type WishDrawerProps = {
  open: boolean;
  initialValues?: Partial<WishUI>;
  onClose: () => void;
  onSave: (values: WishUI) => void;
};

export const WishDrawer: React.FC<WishDrawerProps> = ({ open, initialValues, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

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
      title="Éditer le souhait"
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="primary" loading={saving} onClick={() => form.submit()}>
            Enregistrer
          </Button>
        </Space>
      }
    >
      <Tabs
        items={[
          {
            key: "general",
            label: "Général",
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
