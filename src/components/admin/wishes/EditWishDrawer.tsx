import { useEffect, useState } from "react";
import {
  Drawer,
  Tabs,
  Button,
  Space,
  Form,
  Modal,
  Typography,
  Input,
  InputNumber,
  Select,
  Switch,
  Segmented,
} from "antd";
import { WishUI } from "../../../types/wish";

export type EditWishDrawerProps = {
  open: boolean;
  initialValues?: Partial<WishUI>;
  focusField?: keyof WishUI;
  onClose: () => void;
  onSave: (values: WishUI) => Promise<void> | void;
};

export const EditWishDrawer: React.FC<EditWishDrawerProps> = ({
  open,
  initialValues,
  focusField,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm<WishUI>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) form.setFieldsValue(initialValues as any);
      if (focusField) {
        setTimeout(() => {
          form.scrollToField(focusField);
          const instance = form.getFieldInstance?.(focusField as any);
          if (instance?.focus) instance.focus();
        }, 0);
      }
    }
  }, [open, initialValues, focusField, form]);

  const handleClose = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: "Des modifications non sauvegardées",
        onOk: onClose,
      });
    } else {
      onClose();
    }
  };

  const submit = async () => {
    try {
      const values = (await form.validateFields()) as WishUI;
      setSaving(true);
      await onSave(values);
      setSaving(false);
    } catch {
      setSaving(false);
    }
  };

  return (
    <Drawer
      width={520}
      open={open}
      destroyOnClose
      onClose={handleClose}
      title={
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Éditer le souhait
          </Typography.Title>
          <Typography.Text type="secondary">
            Peaufine ton souhait, on s'occupe du reste 💡
          </Typography.Text>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={handleClose}>Annuler</Button>
          <Button type="primary" loading={saving} onClick={submit}>
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
              <Form layout="vertical" form={form}>
                <Form.Item name="name" label="Titre" rules={[{ required: true }]}> 
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="url" label="URL"> 
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="image_url" label="Image"> 
                  <Input size="large" />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: "details",
            label: "Détails",
            children: (
              <Form layout="vertical" form={form}>
                <Form.Item name="price" label="Prix">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="currency" label="Devise">
                  <Select options={["EUR", "USD", "GBP"].map((v) => ({ value: v }))} />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="quantity" label="Quantité">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="tags" label="Tags">
                  <Select mode="tags" tokenSeparators={[","]} />
                </Form.Item>
                <Form.Item name="note_private" label="Note privée"> 
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="priority" label="Priorité">
                  <Segmented options={[1, 2, 3]} />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: "visibility",
            label: "Visibilité",
            children: (
              <Form layout="vertical" form={form}>
                <Form.Item name="status" label="Statut">
                  <Select options={["draft", "available", "reserved", "received", "archived"].map((v) => ({ value: v }))} />
                </Form.Item>
                <Form.Item name="is_public" label="Public ?" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Form>
            ),
          },
        ]}
      />
    </Drawer>
  );
};
