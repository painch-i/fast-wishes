import React, { useEffect, useState } from "react";
import { Drawer, Form, Input, InputNumber, Button, Select, Space, Tag, message } from "antd";
import { useMediaQuery } from "@mui/material";
import type { WishUI } from "../../types/wish";

export interface AddWishSheetProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: WishUI) => void;
}

const DRAFT_KEY = "add-wish-draft";

export const AddWishSheet: React.FC<AddWishSheetProps> = ({ open, onCancel, onSubmit }) => {
  const [form] = Form.useForm<WishUI>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [linkDomain, setLinkDomain] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          form.setFieldsValue(data);
          if (data.url) {
            try {
              const url = new URL(data.url);
              setLinkDomain(url.hostname);
            } catch {
              setLinkDomain(null);
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }, [open, form]);

  // Save as draft on each change
  const handleValuesChange = (_: any, values: WishUI) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    try {
      const url = new URL(value);
      setLinkDomain(url.hostname);
    } catch {
      setLinkDomain(null);
    }
  };

  const handleFinish = (values: WishUI) => {
    const url = values.url as string | undefined;
    if (url) {
      try {
        new URL(url);
      } catch {
        message.warning("Lien invalide, il sera ignoré");
      }
    }
    onSubmit({ ...values, price: values.price ?? undefined } as WishUI);
    localStorage.removeItem(DRAFT_KEY);
  };

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      placement={isMobile ? "bottom" : "right"}
      height={isMobile ? "auto" : undefined}
      width={isMobile ? undefined : 360}
      title="Ajouter un souhait 🎁"
      extra={<span style={{ color: "#6B7280" }}>Note l’essentiel, tu pourras peaufiner après.</span>}
    >
      <Form layout="vertical" form={form} onFinish={handleFinish} onValuesChange={handleValuesChange}>
        <Form.Item
          name="name"
          label="Titre"
          rules={[{ required: true, min: 2, message: "Un titre est requis" }]}
          extra="Un nom clair aide tes proches à choisir."
        >
          <Input placeholder="Bouilloire inox silencieuse" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          extra="Un message perso motive l’offreur 💌."
        >
          <Input.TextArea
            placeholder="Pourquoi ça me ferait plaisir ? Une petite note pour guider (couleur, taille, usage…)."
            autoSize={{ minRows: 3, maxRows: 4 }}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Prix"
          extra="Indique un budget pour faciliter le choix."
        >
          <Space.Compact>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="0"
            />
            <Form.Item name="currency" initialValue="EUR" noStyle>
              <Select style={{ width: 80 }}>
                <Select.Option value="EUR">EUR</Select.Option>
                <Select.Option value="GBP">GBP</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
              </Select>
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item name="url" label="Lien" extra="Ajoute un lien pour aider à trouver le bon produit.">
          <Input
            placeholder="https://amazon.fr/… (ou autre site)"
            inputMode="url"
            onChange={handleLinkChange}
          />
        </Form.Item>
        {linkDomain && (
          <Tag style={{ marginBottom: 16 }}>
            {linkDomain} {" "}
            <a href={form.getFieldValue("url")} target="_blank" rel="noopener noreferrer">
              Ouvrir
            </a>
          </Tag>
        )}

        <div style={{
          position: "sticky",
          bottom: 0,
          background: "#fff",
          padding: "8px 0",
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
        }}>
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="primary" htmlType="submit">
            Ajouter
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

