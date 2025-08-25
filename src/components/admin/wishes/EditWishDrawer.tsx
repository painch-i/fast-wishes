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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
        title: t("wish.drawer.unsaved"),
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
            {t("wish.drawer.title")}
          </Typography.Title>
          <Typography.Text type="secondary">
            {t("wish.drawer.help")}
          </Typography.Text>
        </Space>
      }
      extra={
        <Space>
          <Button onClick={handleClose}>{t("common.cancel")}</Button>
          <Button type="primary" loading={saving} onClick={submit}>
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
              <Form layout="vertical" form={form}>
                <Form.Item name="name" label={t("wish.form.title.label")} rules={[{ required: true }]}> 
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="url" label={t("wish.form.url.label")}>
                  <Input size="large" />
                </Form.Item>
                <Form.Item name="image_url" label={t("wish.form.image.label")}>
                  <Input size="large" />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: "details",
            label: t("wish.drawer.tabs.details"),
            children: (
              <Form layout="vertical" form={form}>
                <Form.Item name="price" label={t("wish.form.price.label")}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="currency" label={t("wish.form.currency.label")}>
                  <Select
                    options={[form.getFieldValue("currency"), "EUR", "USD", "GBP"]
                      .filter((v): v is string => !!v)
                      .filter((v, i, arr) => arr.indexOf(v) === i)
                      .map((v) => ({ value: v }))}
                  />
                </Form.Item>
                <Form.Item name="description" label={t("wish.form.description.label")}>
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="quantity" label={t("wish.form.quantity.label")}>
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item name="tags" label={t("wish.form.tags.label")}>
                  <Select mode="tags" tokenSeparators={[","]} />
                </Form.Item>
                <Form.Item name="note_private" label={t("wish.form.notePrivate.label")}>
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item name="priority" label={t("wish.form.priority.label")}>
                  <Segmented options={[1, 2, 3]} />
                </Form.Item>
              </Form>
            ),
          },
          {
            key: "visibility",
            label: t("wish.drawer.tabs.visibility"),
            children: (
              <Form layout="vertical" form={form}>
                <Form.Item name="status" label={t("wish.form.status.label")}>
                  <Select options={["draft", "available", "reserved", "received", "archived"].map((v) => ({ value: v, label: t(`wish.status.${v}`) }))} />
                </Form.Item>
                <Form.Item name="is_public" label={t("wish.form.isPublic.label")} valuePropName="checked">
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
