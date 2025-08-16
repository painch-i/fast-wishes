import { useEffect, useState } from "react";
import { Modal, Steps, Form, Input, InputNumber, Select, Switch, Button, Space } from "antd";
import { WishUI } from "../../../types/wish";
import { useLinkMetadata } from "../../../hooks/useLinkMetadata";

export type CreateWishWizardProps = {
  open: boolean;
  initialValues?: Partial<WishUI>;
  onCancel: () => void;
  onSubmit: (values: WishUI, asDraft?: boolean) => void;
};

const { Step } = Steps;

export const CreateWishWizard: React.FC<CreateWishWizardProps> = ({
  open,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm<WishUI>();
  const url = Form.useWatch("url", form);
  const { metadata } = useLinkMetadata(url);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues as any);
      }
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

  const next = () => setCurrent((c) => Math.min(c + 1, 2));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleCreate = (asDraft?: boolean) => {
    form
      .validateFields()
      .then((vals) => {
        onSubmit(vals as WishUI, asDraft);
      })
      .catch(() => {});
  };

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={onCancel}
      width="100%"
      style={{ top: 0, padding: 0 }}
      bodyStyle={{ padding: 24, height: "100vh" }}
      destroyOnClose
    >
      <Steps current={current} style={{ marginBottom: 24 }}>
        <Step title="Lien" />
        <Step title="Détails" />
        <Step title="Visibilité" />
      </Steps>

      {current === 0 && (
        <Form layout="vertical" form={form}>
          <p>Colle un lien (Amazon, Etsy…). On pré-remplit pour toi ✨</p>
          <Form.Item name="url" label="URL">
            <Input size="large" placeholder="https://exemple.com/produit/123" />
          </Form.Item>
          <Button type="primary" onClick={next}>Importer les infos</Button>
        </Form>
      )}

      {current === 1 && (
        <Form layout="vertical" form={form}>
          <p>Ajoute ce qui compte : une jolie photo, un petit mot…</p>
          <Form.Item name="title" label="Titre" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image">
            <Input size="large" />
          </Form.Item>
          <Form.Item name="price" label="Prix">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="currency" label="Devise">
            <Select options={["EUR", "USD", "GBP"].map((v) => ({ value: v }))} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" tokenSeparators={[","]} />
          </Form.Item>
        </Form>
      )}

      {current === 2 && (
        <Form layout="vertical" form={form}>
          <p>Tu peux garder ce souhait privé le temps d’ajuster.</p>
          <Form.Item name="isPublic" label="Public ?" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="Statut" initialValue="available">
            <Select
              options={["draft", "available", "reserved", "received", "archived"].map((v) => ({ value: v }))}
            />
          </Form.Item>
        </Form>
      )}

      <Space style={{ marginTop: 24 }}>
        {current > 0 && <Button onClick={prev}>Précédent</Button>}
        {current < 2 && <Button type="primary" onClick={next}>Suivant</Button>}
        {current === 2 && (
          <>
            <Button onClick={() => handleCreate(true)}>Enregistrer comme brouillon</Button>
            <Button type="primary" onClick={() => handleCreate(false)}>Créer le souhait</Button>
          </>
        )}
        <Button onClick={onCancel}>Annuler</Button>
      </Space>
    </Modal>
  );
};
