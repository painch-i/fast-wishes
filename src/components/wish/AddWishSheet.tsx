import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import type { InputRef } from "antd";
import { useMediaQuery } from "@mui/material";
import type { WishUI } from "../../types/wish";
import { useLinkMetadata } from "../../hooks/useLinkMetadata";

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
  const [showPasteTip, setShowPasteTip] = useState(false);
  const linkInputRef = useRef<InputRef | null>(null);
  const initialViewport = useRef<string | null>(null);
  const headerStyleRef = useRef<{ position: string; zIndex: string } | null>(null);

  const url = Form.useWatch("url", form);
  const { metadata } = useLinkMetadata(url ?? undefined);

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
    if (!open) {
      setShowPasteTip(false);
    }
  }, [open, form]);

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

  useEffect(() => {
    if (metadata && !form.getFieldValue("name")) {
      form.setFieldsValue({ name: metadata.title } as any);
    }
  }, [metadata, form]);

  // Lock background scroll and lower header z-index when the sheet is open
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
      body.style.overscrollBehavior = "none";
    } else {
      if (header && headerStyleRef.current) {
        header.style.position = headerStyleRef.current.position;
        header.style.zIndex = headerStyleRef.current.zIndex;
      }
      body.style.overflow = "";
      body.style.overscrollBehavior = "";
    }
  }, [open]);

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
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              Ajouter un souhait
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
      }}
      maskStyle={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        inset: 0,
        zIndex: 1000,
      }}
      zIndex={1001}
      rootClassName="add-wish-sheet"
      getContainer={() => document.body}
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
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 0 16px",
          overscrollBehavior: "contain",
          scrollPaddingBottom: "calc(80px + env(safe-area-inset-bottom))",
        }}
      >
        <Form.Item
          name="name"
          label="Titre"
          rules={[{ required: true, min: 2, message: "Un titre est requis" }]}
          extra="Un nom clair aide tes proches à choisir."
        >
          <Input
            placeholder="Bouilloire inox silencieuse"
            style={{ fontSize: 16 }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          extra="Un message perso motive l’offreur 💌."
        >
          <Input.TextArea
            placeholder="Pourquoi ça me ferait plaisir ? Une petite note pour guider (couleur, taille, usage…)."
            autoSize={{ minRows: 3, maxRows: 4 }}
            style={{ fontSize: 16 }}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="Prix"
          extra="Indique un budget pour faciliter le choix."
        >
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0"
            style={{ fontSize: 16 }}
            addonAfter={
              <Form.Item name="currency" initialValue="EUR" noStyle>
                <Select
                  style={{ width: 80, fontSize: 16 }}
                  getPopupContainer={(trigger) =>
                    (trigger.closest(".add-wish-sheet") as HTMLElement) ||
                    document.body
                  }
                  dropdownStyle={{ zIndex: 1002 }}
                >
                  <Select.Option value="EUR">EUR</Select.Option>
                  <Select.Option value="GBP">GBP</Select.Option>
                  <Select.Option value="USD">USD</Select.Option>
                </Select>
              </Form.Item>
            }
          />
        </Form.Item>

        <Form.Item name="url" label="Lien" extra="Ajoute un lien pour aider à trouver le bon produit.">
          <Space>
            <Input
              ref={linkInputRef}
              placeholder="https://amazon.fr/… (ou autre site)"
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
              Maintiens dans le champ puis Coller
            </Typography.Text>
          )}
        </Form.Item>
        {linkDomain && (
          <Tag style={{ marginBottom: 16 }}>
            {linkDomain} {" "}
            <a href={form.getFieldValue("url")} target="_blank" rel="noopener noreferrer">
              Ouvrir
            </a>
          </Tag>
        )}
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
          <Button type="primary" htmlType="submit">
            Ajouter
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

