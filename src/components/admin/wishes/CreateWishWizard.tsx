import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Steps,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Space,
  Card,
  Typography,
  Grid,
} from "antd";
import { WishUI } from "../../../types/wish";
import { useLinkMetadata } from "../../../hooks/useLinkMetadata";
import { PreviewPublic } from "./PreviewPublic";

export type CreateWishWizardProps = {
  open: boolean;
  initialValues?: Partial<WishUI>;
  onCancel: () => void;
  onSubmit: (values: WishUI, asDraft?: boolean) => void;
};

export const CreateWishWizard: React.FC<CreateWishWizardProps> = ({
  open,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<WishUI>();
  const url = Form.useWatch("url", form);
  const { metadata } = useLinkMetadata(url ?? undefined);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [preview, setPreview] = useState<Partial<WishUI>>({});
  const [stepValid, setStepValid] = useState(true);

  const stepItems = useMemo(
    () => [
      { title: t("wish.wizard.steps.link") },
      { title: t("wish.wizard.steps.details") },
      { title: t("wish.wizard.steps.visibility") },
    ],
    [t]
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues as any);
        setPreview(initialValues);
      } else {
        setPreview({});
      }
      setCurrent(0);
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (metadata) {
      const existing = form.getFieldsValue();
      form.setFieldsValue({
        name: existing.name || metadata.title,
        image_url: existing.image_url || metadata.image,
      } as any);
    }
  }, [metadata, form]);

  const validateStep = () => {
    if (current === 1) {
      form
        .validateFields(["name", "price", "url"])
        .then(() => setStepValid(true))
        .catch(() => setStepValid(false));
    } else {
      setStepValid(true);
    }
    setPreview(form.getFieldsValue());
  };

  const next = () => {
    if (current === 1) {
      validateStep();
      if (!stepValid) return;
    }
    setCurrent((c) => Math.min(c + 1, 2));
  };

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleCreate = (asDraft?: boolean) => {
    setLoading(true);
    form
      .validateFields()
      .then((vals) => {
        onSubmit(vals as WishUI, asDraft);
      })
      .finally(() => setLoading(false));
  };

  const header = isMobile ? (
    <div
      style={{
        padding: 16,
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        zIndex: 2,
        background: "#fff",
      }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("wish.wizard.title")}
      </Typography.Title>
      <Steps
        current={current}
        onChange={setCurrent}
        size="small"
        items={stepItems.map((s, i) => ({ title: `${i + 1} ${s.title}` }))}
      />
    </div>
  ) : null;

  const actions = (
    <div
      className="wizardActions"
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 2,
        background: "#fff",
        borderTop: "1px solid #eee",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.03)",
        padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
      }}
    >
      <Space>
        {current > 0 && (
          <Button onClick={prev} size="large">
            {t("wish.wizard.actions.previous")}
          </Button>
        )}
        {current < 2 && (
          <Button
            type="primary"
            onClick={next}
            size="large"
            disabled={current === 1 && !stepValid}
          >
            {t("wish.wizard.actions.next")}
          </Button>
        )}
        {current === 2 && (
          <Button
            type="primary"
            onClick={() => handleCreate(false)}
            size="large"
            loading={loading}
            disabled={!stepValid}
          >
            {t("wish.wizard.actions.create")}
          </Button>
        )}
        <Button type="text" onClick={onCancel} size="large">
          {t("common.cancel")}
        </Button>
      </Space>
    </div>
  );

  const linkStep = (
    <Card title={t("wish.wizard.steps.link")} bordered={false} style={{ marginBottom: 16 }}>
      <Typography.Paragraph>{t("wish.wizard.link.intro")}</Typography.Paragraph>
      <Form.Item
        name="url"
        label={t("wish.form.url.label")}
        rules={[{ type: "url", message: t("wish.wizard.link.url.invalid") }]}
      >
        <Input
          size="large"
          placeholder={t("wish.wizard.link.url.placeholder")}
          onBlur={validateStep}
        />
      </Form.Item>
      <Button type="primary" onClick={next} size="large">
        {t("wish.wizard.actions.import")}
      </Button>
      {metadata && (
        <div style={{ marginTop: 16 }}>
          <Space>
            {metadata.favicon && (
              <img src={metadata.favicon} alt="" width={16} height={16} />
            )}
            <span>{metadata.title || metadata.site_name}</span>
          </Space>
        </div>
      )}
    </Card>
  );

  const detailsStep = (
    <div style={{ display: isMobile ? "block" : "flex", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <Card
          title={t("wish.wizard.details.essential.title")}
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <Typography.Paragraph>
            {t("wish.wizard.details.essential.intro")}
          </Typography.Paragraph>
          <Form.Item
            name="name"
            label={t("wish.form.title.label")}
            rules={[{ required: true, message: t("wish.wizard.messages.nameRequired") }]}
          >
            <Input size="large" onBlur={validateStep} />
          </Form.Item>
          <Form.Item name="image_url" label={t("wish.form.image.label")}>
            <Input size="large" onBlur={validateStep} />
          </Form.Item>
          <Form.Item
            name="price"
            label={t("wish.form.price.label")}
            rules={[{ type: "number", min: 0, message: t("wish.wizard.messages.priceMin") }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              onBlur={validateStep}
            />
          </Form.Item>
          <Form.Item name="currency" label={t("wish.form.currency.label")}>
            <Select
              options={[form.getFieldValue("currency"), "EUR", "USD", "GBP"]
                .filter((v): v is string => !!v)
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .map((v) => ({ value: v }))}
              onChange={validateStep}
            />
          </Form.Item>
        </Card>
        <Card
          title={t("wish.wizard.details.optional.title")}
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="description" label={t("wish.form.description.label")}>
            <Input.TextArea rows={3} onBlur={validateStep} />
          </Form.Item>
          <Form.Item name="tags" label={t("wish.form.tags.label")}>
            <Select mode="tags" tokenSeparators={[","]} onChange={validateStep} />
          </Form.Item>
          <Form.Item name="quantity" label={t("wish.form.quantity.label")}>
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              onBlur={validateStep}
            />
          </Form.Item>
          <Form.Item name="priority" label={t("wish.form.priority.label")}> 
            <Select
              options={[1, 2, 3].map((v) => ({ value: v }))}
              onChange={validateStep}
            />
          </Form.Item>
          <Form.Item name="note_private" label={t("wish.form.notePrivate.label")}>
            <Input.TextArea rows={2} onBlur={validateStep} />
          </Form.Item>
        </Card>
      </div>
      <div style={{ width: isMobile ? "100%" : 260 }}>
        <PreviewPublic wish={preview as WishUI} />
      </div>
    </div>
  );

  const visibilityStep = (
    <Card
      title={t("wish.wizard.visibility.title")}
      bordered={false}
      style={{ marginBottom: 16 }}
    >
      <Typography.Paragraph>
        {t("wish.wizard.visibility.intro")}
      </Typography.Paragraph>
      <Form.Item name="status" label={t("wish.form.status.label")} initialValue="draft">
        <Select
          options={["draft", "available", "reserved", "received", "archived"].map((v) => ({
            value: v,
            label: t(`wish.status.${v}`),
          }))}
          onChange={validateStep}
        />
      </Form.Item>
      <Form.Item
        name="is_public"
        label={t("wish.form.isPublic.label")}
        valuePropName="checked"
      >
        <Switch onChange={validateStep} />
      </Form.Item>
    </Card>
  );

  const content = (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: 16,
        paddingBottom: 120,
      }}
    >
      <Form form={form} layout="vertical" onValuesChange={validateStep}>
        {current === 0 && linkStep}
        {current === 1 && detailsStep}
        {current === 2 && visibilityStep}
      </Form>
    </div>
  );

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={onCancel}
      width="100%"
      style={{ top: 0, padding: 0 }}
      bodyStyle={{ padding: 0, height: "100vh", display: "flex", flexDirection: "column" }}
      destroyOnClose
    >
      {header}
      <div style={{ flex: 1, display: isMobile ? "block" : "flex" }}>
        {!isMobile && (
          <div
            style={{
              width: 240,
              borderRight: "1px solid #eee",
              padding: 24,
              overflowY: "auto",
            }}
          >
            <Steps
              direction="vertical"
              current={current}
              onChange={setCurrent}
              items={stepItems}
            />
          </div>
        )}
        {content}
      </div>
      {actions}
    </Modal>
  );
};

