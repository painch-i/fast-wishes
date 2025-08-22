import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Checkbox,
  Segmented,
  AutoComplete,
  Tag,
  message,
} from "antd";
import type { InputRef } from "antd";
import { useMediaQuery } from "@mui/material";
import type { WishUI } from "../../types/wish";
import { useLinkMetadata } from "../../hooks/useLinkMetadata";

export interface WishSheetProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<WishUI>;
  onCancel: () => void;
  onSubmit: (values: WishUI) => void;
}

export const WishSheet: React.FC<WishSheetProps> = ({
  open,
  mode,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<WishUI>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [linkDomain, setLinkDomain] = useState<string | null>(null);
  const [showPasteTip, setShowPasteTip] = useState(false);
  const linkInputRef = useRef<InputRef | null>(null);
  const initialViewport = useRef<string | null>(null);
  const headerStyleRef = useRef<{ position: string; zIndex: string } | null>(null);

  const url = Form.useWatch("url", form);
  const { metadata } = useLinkMetadata(url ?? undefined);

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues as any);
        if (initialValues.url) {
          try {
            const hostname = new URL(initialValues.url).hostname.replace(/^www\./, "");
            setLinkDomain(hostname);
          } catch {
            setLinkDomain(null);
          }
        }
      }
      if (mode === "create") {
        const raw = localStorage.getItem("wish-draft");
        if (raw) {
          try {
            form.setFieldsValue(JSON.parse(raw));
          } catch {
            /* ignore */
          }
        }
      }
    } else {
      setShowPasteTip(false);
    }
  }, [open, initialValues, form, mode]);

  // iOS anti-zoom
  useEffect(() => {
    const metaViewport = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement | null;
    if (!metaViewport) return;
    if (initialViewport.current === null) {
      initialViewport.current = metaViewport.getAttribute("content") || "";
    }
    if (open) {
      metaViewport.setAttribute(
        "content",
        `${initialViewport.current}, maximum-scale=1`
      );
    } else {
      metaViewport.setAttribute("content", initialViewport.current);
    }
  }, [open]);

  // apply metadata
  useEffect(() => {
    if (!metadata) return;
    const updates: Partial<WishUI> = {};
    if (metadata.image && !form.getFieldValue("image_url")) {
      updates.image_url = metadata.image;
    }
    if ((metadata.site_name || metadata.title) && !form.getFieldValue("brand")) {
      updates.brand = metadata.site_name || metadata.title;
    }
    if (Object.keys(updates).length > 0) form.setFieldsValue(updates as any);
  }, [metadata, form]);

  // lock background scroll
  useEffect(() => {
    const body = document.body;
    const header = document.querySelector(
      ".MuiAppBar-root"
    ) as HTMLElement | null;
    if (open) {
      headerStyleRef.current = {
        position: header?.style.position || "",
        zIndex: header?.style.zIndex || "",
      };
      if (header) {
        header.style.position = "relative";
        header.style.zIndex = "0";
      }
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "contain";
    } else {
      if (header && headerStyleRef.current) {
        header.style.position = headerStyleRef.current.position;
        header.style.zIndex = headerStyleRef.current.zIndex;
      }
      body.style.overflow = "";
      body.style.overscrollBehavior = "";
    }
  }, [open]);

  const handleValuesChange = (_: any, values: WishUI) => {
    if (mode === "create") {
      localStorage.setItem("wish-draft", JSON.stringify(values));
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    try {
      const url = new URL(value);
      const domain = url.hostname.replace(/^www\./, "");
      setLinkDomain(domain);
      form.setFieldsValue({ merchant_domain: domain } as any);
    } catch {
      setLinkDomain(null);
      form.setFieldsValue({ merchant_domain: undefined } as any);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        form.setFieldsValue({ url: text } as any);
        handleLinkChange({ target: { value: text } } as any);
        message.success("Lien ajouté ✨");
        setShowPasteTip(false);
      }
    } catch {
      setShowPasteTip(true);
      linkInputRef.current?.focus();
    }
  };

  const handleFinish = (values: WishUI) => {
    const priceNumber = values.price ? parseFloat(String(values.price)) : undefined;
    const price_cents = priceNumber != null ? Math.round(priceNumber * 100) : null;
    const submitValues: WishUI = {
      ...initialValues,
      ...values,
      price_cents,
    } as WishUI;
    onSubmit(submitValues);
    if (mode === "create") localStorage.removeItem("wish-draft");
  };

  const tagOptions = [
    "Maison",
    "Cuisine",
    "Sport",
    "Lecture",
    "Tech",
    "Mode",
    "Beauté",
    "Jeux",
  ].map((t) => ({ value: t }));

  return (
    <Drawer
      open={open}
      onClose={onCancel}
      placement={isMobile ? "bottom" : "right"}
      height={isMobile ? "90vh" : undefined}
      width={isMobile ? undefined : 360}
      title={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          {isMobile && (
            <div
              style={{
                width: 40,
                height: 4,
                background: "#ccc",
                borderRadius: 2,
                margin: "0 auto",
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Typography.Title
              level={4}
              style={{
                margin: 0,
                lineHeight: 1.2,
                fontSize: "clamp(20px, 5vw, 22px)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {mode === "create" ? "Ajouter un souhait" : "Modifier le souhait"}
            </Typography.Title>
            <Typography.Text
              style={{
                margin: 0,
                lineHeight: 1.35,
                color: "#6B7280",
                display: "block",
                fontSize: 16,
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "anywhere",
              }}
            >
              Note l’essentiel, tu pourras peaufiner après.
            </Typography.Text>
          </div>
        </div>
      }
      headerStyle={{
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 0,
        zIndex: 1,
      }}
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        paddingBottom: 0,
        overscrollBehavior: "contain",
      }}
      maskStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      zIndex={1001}
      rootClassName="wish-sheet"
      getContainer={document.body}
      contentWrapperStyle={{
        maxHeight: isMobile ? "90vh" : undefined,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        background: "#fff",
      }}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        style={{ flex: 1, overflowY: "auto", padding: "0 0 16px" }}
      >
        <Form.Item
          name="name"
          label="Titre"
          rules={[{ required: true, min: 2, message: "Un titre est requis" }]}
          extra="Un nom clair aide tes proches à choisir."
        >
          <Input
            placeholder="Arrosoir inox Haws 1 L"
            style={{ fontSize: 16 }}
          />
        </Form.Item>

        <Form.Item
          label="Prix"
          extra="Indique un budget pour faciliter le choix."
        >
          <Space.Compact block>
            <Form.Item name="price" noStyle>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0"
                style={{ fontSize: 16 }}
              />
            </Form.Item>
            <Form.Item name="currency" initialValue="EUR" noStyle>
              <Select
                style={{ width: 80, fontSize: 16 }}
                getPopupContainer={(trigger) =>
                  (trigger.closest(".wish-sheet") as HTMLElement) ||
                  document.body
                }
                dropdownStyle={{ zIndex: 1002 }}
              >
                <Select.Option value="EUR">EUR</Select.Option>
                <Select.Option value="GBP">GBP</Select.Option>
                <Select.Option value="USD">USD</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="price_is_approx"
              valuePropName="checked"
              noStyle
            >
              <Checkbox
                aria-label="Prix approximatif"
                style={{ padding: "0 8px", fontSize: 16 }}
              >
                ≈
              </Checkbox>
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item name="url" label="Lien marchand">
          <Space>
            <Input
              ref={linkInputRef}
              placeholder="https://… (Amazon, Etsy, marque…)"
              inputMode="url"
              onChange={handleLinkChange}
              style={{ flex: 1, fontSize: 16 }}
            />
            <Button onClick={handlePaste} style={{ fontSize: 16 }}>
              Coller
            </Button>
          </Space>
          {showPasteTip && (
            <Typography.Text type="secondary">
              Maintiens puis Coller
            </Typography.Text>
          )}
        </Form.Item>
        {linkDomain && (
          <Tag style={{ marginBottom: 16 }}>{linkDomain}</Tag>
        )}

        <Form.Item name="description" label="Commentaire perso">
          <Input.TextArea
            placeholder="Pourquoi ça me ferait plaisir ? Couleur, taille, usage… 💌"
            autoSize={{ minRows: 3, maxRows: 4 }}
            style={{ fontSize: 16 }}
          />
        </Form.Item>

        <Form.Item name="priority" label="Priorité" initialValue={2}>
          <Segmented
            options={[
              { label: "⭐ Essentiel", value: 1 },
              { label: "💡 Envie", value: 2 },
              { label: "🎲 Surprise", value: 3 },
            ]}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="tag" label="Tag">
          <AutoComplete
            options={tagOptions}
            style={{ fontSize: 16 }}
            placeholder=""
          />
        </Form.Item>

        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "#fff",
            padding: "8px 0",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
          }}
        >
          <Button onClick={onCancel}>Annuler</Button>
          <Button
            type="primary"
            htmlType="submit"
            aria-label={mode === "create" ? "Ajouter" : "Enregistrer"}
          >
            {mode === "create" ? "Ajouter" : "Enregistrer"}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

