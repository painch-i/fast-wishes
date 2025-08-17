import { useEffect, useState } from "react";
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

const stepItems = [
  { title: "Lien" },
  { title: "Détails" },
  { title: "Visibilité" },
];

export const CreateWishWizard: React.FC<CreateWishWizardProps> = ({
  open,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<WishUI>();
  const url = Form.useWatch("url", form);
  const { metadata } = useLinkMetadata(url);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [preview, setPreview] = useState<Partial<WishUI>>({});
  const [stepValid, setStepValid] = useState(true);

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
        title: existing.title || metadata.title,
        imageUrl: existing.imageUrl || metadata.image,
      } as any);
    }
  }, [metadata, form]);

  const validateStep = () => {
    if (current === 1) {
      form
        .validateFields(["title", "price", "url"])
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
        Créer un souhait
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
            Précédent
          </Button>
        )}
        {current < 2 && (
          <Button
            type="primary"
            onClick={next}
            size="large"
            disabled={current === 1 && !stepValid}
          >
            Suivant
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
            Créer
          </Button>
        )}
        <Button type="text" onClick={onCancel} size="large">
          Annuler
        </Button>
      </Space>
    </div>
  );

  const linkStep = (
    <Card title="Lien" bordered={false} style={{ marginBottom: 16 }}>
      <Typography.Paragraph>
        Colle un lien (Amazon, Etsy…). On pré-remplit pour toi ✨
      </Typography.Paragraph>
      <Form.Item name="url" label="URL" rules={[{ type: "url", message: "URL invalide" }]}>
        <Input
          size="large"
          placeholder="https://exemple.com/produit/123"
          onBlur={validateStep}
        />
      </Form.Item>
      <Button type="primary" onClick={next} size="large">
        Importer les infos
      </Button>
      {metadata && (
        <div style={{ marginTop: 16 }}>
          <Space>
            {metadata.favicon && (
              <img src={metadata.favicon} alt="" width={16} height={16} />
            )}
            <span>{metadata.title || metadata.siteName}</span>
          </Space>
        </div>
      )}
    </Card>
  );

  const detailsStep = (
    <div style={{ display: isMobile ? "block" : "flex", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <Card title="Essentiel" bordered={false} style={{ marginBottom: 16 }}>
          <Typography.Paragraph>
            Ajoute ce qui compte : une jolie photo, un petit mot…
          </Typography.Paragraph>
          <Form.Item
            name="title"
            label="Titre"
            rules={[{ required: true, message: "Titre requis" }]}
          >
            <Input size="large" onBlur={validateStep} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image">
            <Input size="large" onBlur={validateStep} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Prix"
            rules={[{ type: "number", min: 0, message: "Prix ≥ 0" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              onBlur={validateStep}
            />
          </Form.Item>
          <Form.Item name="currency" label="Devise">
            <Select
              options={["EUR", "USD", "GBP"].map((v) => ({ value: v }))}
              onChange={validateStep}
            />
          </Form.Item>
        </Card>
        <Card title="Optionnel" bordered={false} style={{ marginBottom: 16 }}>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} onBlur={validateStep} />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" tokenSeparators={[","]} onChange={validateStep} />
          </Form.Item>
          <Form.Item name="quantity" label="Quantité">
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              onBlur={validateStep}
            />
          </Form.Item>
          <Form.Item name="priority" label="Priorité">
            <Select
              options={[1, 2, 3].map((v) => ({ value: v }))}
              onChange={validateStep}
            />
          </Form.Item>
          <Form.Item name="notePrivate" label="Note privée">
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
    <Card title="Statut & partage" bordered={false} style={{ marginBottom: 16 }}>
      <Typography.Paragraph>
        Tu peux garder ce souhait privé le temps d’ajuster.
      </Typography.Paragraph>
      <Form.Item name="status" label="Statut" initialValue="draft">
        <Select
          options={["draft", "available", "reserved", "received", "archived"].map((v) => ({ value: v }))}
          onChange={validateStep}
        />
      </Form.Item>
      <Form.Item name="isPublic" label="Public ?" valuePropName="checked">
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

