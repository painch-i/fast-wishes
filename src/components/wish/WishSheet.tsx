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
  message,
} from "antd";
import type { InputRef } from "antd";
import { CloseCircleFilled, ExportOutlined } from "@ant-design/icons";
import { useMediaQuery } from "@mui/material";
import type { WishUI } from "../../types/wish";
import { useLinkMetadata } from "../../hooks/useLinkMetadata";
import { colors } from "../../theme";
import { guessUserCurrency } from "../../utility";
import { useGetIdentity } from "@refinedev/core";
import { useTranslation } from "react-i18next";

export interface WishSheetProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<WishUI>;
  previousWishCurrency?: string;
  onCancel: () => void;
  onSubmit: (values: WishUI) => void;
}

export const WishSheet: React.FC<WishSheetProps> = ({
  open,
  mode,
  initialValues,
  previousWishCurrency,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<WishUI>();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [linkDomain, setLinkDomain] = useState<string | null>(null);
  const [showPasteTip, setShowPasteTip] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [debouncedUrl, setDebouncedUrl] = useState<string | undefined>(undefined);
  const linkInputRef = useRef<InputRef | null>(null);
  const initialViewport = useRef<string | null>(null);
  const headerStyleRef = useRef<{ position: string; zIndex: string } | null>(null);
  const { data: identity } = useGetIdentity<
    { currency?: string; country_code?: string } | undefined
  >();

  const currency = Form.useWatch("currency", form);

  const url = Form.useWatch("url", form);
  const { metadata } = useLinkMetadata(debouncedUrl);

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
        if (!form.getFieldValue("currency")) {
          const guessed = guessUserCurrency({
            profileCurrency: identity?.currency,
            profileCountry: identity?.country_code,
            previousWishCurrency,
          });
          form.setFieldsValue({ currency: guessed } as any);
        }
      }
    } else {
      setShowPasteTip(false);
    }
  }, [open, initialValues, form, mode, identity, previousWishCurrency]);

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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!url) {
        setLinkDomain(null);
        form.setFieldsValue({ merchant_domain: undefined } as any);
        setIsUrlValid(true);
        setDebouncedUrl(undefined);
        return;
      }
      let value = url.trim();
      if (!/^https?:\/\//i.test(value)) {
        value = `https://${value}`;
        form.setFieldsValue({ url: value } as any);
      }
      try {
        const parsed = new URL(value);
        const domain = parsed.hostname.replace(/^www\./, "");
        setLinkDomain(domain);
        form.setFieldsValue({ merchant_domain: domain } as any);
        setIsUrlValid(true);
        setDebouncedUrl(value);
      } catch {
        setLinkDomain(null);
        form.setFieldsValue({ merchant_domain: undefined } as any);
        setIsUrlValid(false);
        setDebouncedUrl(undefined);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [url, form]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        form.setFieldsValue({ url: text } as any);
        linkInputRef.current?.focus({ cursor: "end" });
        message.success(t("wish.sheet.url.toast"));
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
              {mode === "create" ? t("wish.sheet.title.create") : t("wish.sheet.title.edit")}
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
              {t("wish.sheet.subtitle")}
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
          label={t("wish.form.title.label")}
          rules={[{ required: true, min: 2, message: t("wish.sheet.name.required") }]}
          extra={t("wish.sheet.name.extra")}
        >
          <Input
            placeholder={t("wish.sheet.name.placeholder")}
            style={{ fontSize: 16 }}
          />
        </Form.Item>

        <Form.Item
          label={t("wish.form.price.label")}
          extra={t("wish.sheet.price.extra")}
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
            <Form.Item name="currency" noStyle>
              <Select
                aria-haspopup="listbox"
                style={{ width: 80, fontSize: 16 }}
                getPopupContainer={() => document.body}
                dropdownStyle={{ zIndex: 1002 }}
              >
                {[currency, "EUR", "GBP", "USD"]
                  .filter((v): v is string => !!v)
                  .filter(
                    (v, i, arr) => arr.indexOf(v) === i
                  )
                  .map((v) => (
                    <Select.Option
                      key={v}
                      value={v}
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    >
                      {v}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="price_is_approx"
              valuePropName="checked"
              noStyle
            >
              <Checkbox
                aria-label={t("wish.sheet.price.approxAria")}
                style={{ padding: "0 8px", fontSize: 16 }}
              >
                ≈
              </Checkbox>
            </Form.Item>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="url"
          label={t("wish.sheet.url.label")}
          validateStatus={!isUrlValid ? "error" : undefined}
          help={
            !isUrlValid
              ? t("wish.sheet.url.invalid")
              : showPasteTip
              ? t("wish.sheet.url.pasteTip")
              : undefined
          }
        >
          <Space.Compact style={{ width: "100%" }}>
            <Input
              ref={linkInputRef}
              placeholder={t("wish.sheet.url.placeholder")}
              inputMode="url"
              onChange={() => setShowPasteTip(false)}
              style={{ fontSize: 16 }}
              suffix={
                <Space size={4}>
                  {url && (
                    <CloseCircleFilled
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        form.setFieldsValue({ url: undefined, merchant_domain: undefined } as any);
                        setLinkDomain(null);
                        setIsUrlValid(true);
                        setShowPasteTip(false);
                        setDebouncedUrl(undefined);
                      }}
                      style={{ color: colors.textSecondary }}
                    />
                  )}
                  {url && isUrlValid && (
                    <ExportOutlined
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      style={{ color: colors.textSecondary }}
                    />
                  )}
                </Space>
              }
            />
            <Button onClick={handlePaste} style={{ fontSize: 16 }}>
              {t("wish.sheet.url.button")}
            </Button>
          </Space.Compact>
        </Form.Item>
        {!showPasteTip && isUrlValid && (linkDomain || metadata?.title) && (
          <Typography.Text
            type="secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 16,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {metadata?.favicon && (
              <img
                src={metadata.favicon}
                alt=""
                width={16}
                height={16}
                style={{ flexShrink: 0 }}
              />
            )}
            {linkDomain && (
              <span style={{ color: colors.textPrimary }}>{linkDomain}</span>
            )}
            {metadata?.title && (
              <span style={{ color: colors.textSecondary, overflow: "hidden", textOverflow: "ellipsis" }}>
                {metadata.title}
              </span>
            )}
          </Typography.Text>
        )}

        <Form.Item name="description" label={t("wish.sheet.description.label")}>
          <Input.TextArea
            placeholder={t("wish.sheet.description.placeholder")}
            autoSize={{ minRows: 3, maxRows: 4 }}
            style={{ fontSize: 16 }}
          />
        </Form.Item>

        <Form.Item name="priority" label={t("wish.form.priority.label")} initialValue={2}>
          <Segmented
            options={[
              { label: t("wish.sheet.priority.options.1"), value: 1 },
              { label: t("wish.sheet.priority.options.2"), value: 2 },
              { label: t("wish.sheet.priority.options.3"), value: 3 },
            ]}
            style={{ width: "100%" }}
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
          <Button onClick={onCancel}>{t("common.cancel")}</Button>
          <Button
            type="primary"
            htmlType="submit"
            aria-label={mode === "create" ? t("common.add") : t("common.save")}
          >
            {mode === "create" ? t("common.add") : t("common.save")}
          </Button>
        </div>
      </Form>
    </Drawer>
  );
};

