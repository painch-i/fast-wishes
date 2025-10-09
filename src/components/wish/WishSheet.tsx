import { CloseCircleFilled, ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { useMediaQuery } from "@mui/material";
import { useGetIdentity } from "@refinedev/core";
import type { InputRef } from "antd";
import {
  Button,
  Drawer,
  Form,
  Input,
  Segmented,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLinkMetadata } from "../../hooks/useLinkMetadata";
import { colors } from "../../theme";
import type { WishFormValues, WishImage, WishUI } from "../../types/wish";
import { guessUserCurrency } from "../../utility";
import type { RcFile, UploadFile } from "antd/es/upload/interface";

export interface WishSheetProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<WishFormValues>;
  previousWishCurrency?: string;
  onCancel: () => void;
  onSubmit: (values: WishFormValues) => void;
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
  const [existingImages, setExistingImages] = useState<WishImage[]>([]);
  const [removedImages, setRemovedImages] = useState<WishImage[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const activeImages = existingImages.filter(
    (image) => !removedImages.some((removed) => removed.id === image.id)
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (initialValues) {
        form.setFieldsValue(initialValues as any);
        setExistingImages(initialValues.images ?? []);
        setRemovedImages([]);
        setFileList([]);
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
        setExistingImages([]);
        setRemovedImages([]);
        setFileList([]);
      }
    } else {
      setShowPasteTip(false);
      setExistingImages([]);
      setRemovedImages([]);
      setFileList([]);
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

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_TOTAL_IMAGES = 6;

  const handleBeforeUpload = (file: RcFile) => {
    if (!file.type?.startsWith("image/")) {
      message.error(t("wish.sheet.images.invalid"));
      return Upload.LIST_IGNORE;
    }
    if (file.size && file.size > MAX_IMAGE_SIZE) {
      message.error(t("wish.sheet.images.tooLarge"));
      return Upload.LIST_IGNORE;
    }
    const total = activeImages.length + fileList.length;
    if (total >= MAX_TOTAL_IMAGES) {
      message.warning(t("wish.sheet.images.limit"));
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleUploadChange = ({ fileList: next }: { fileList: UploadFile[] }) => {
    const total = activeImages.length + next.length;
    if (total > MAX_TOTAL_IMAGES) {
      message.warning(t("wish.sheet.images.limit"));
      setFileList(next.slice(0, Math.max(0, MAX_TOTAL_IMAGES - activeImages.length)));
      return;
    }
    setFileList(next);
  };

  const handleRemoveExisting = (image: WishImage) => {
    setRemovedImages((prev) => {
      if (prev.some((img) => img.id === image.id)) return prev;
      return [...prev, image];
    });
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
    const retainedImages = existingImages.filter(
      (img) => !removedImages.some((removed) => removed.id === img.id)
    );
    const newFiles = fileList.reduce<File[]>((acc, file) => {
      if (file.originFileObj) {
        acc.push(file.originFileObj as File);
      }
      return acc;
    }, []);
    const priceNumber = values.price ? parseFloat(String(values.price)) : undefined;
    const price_cents = priceNumber != null ? Math.round(priceNumber * 100) : null;
    const submitValues: WishFormValues = {
      ...initialValues,
      ...values,
      price_cents,
      images: retainedImages,
      newImages: newFiles,
      removedImages,
    } as WishFormValues;
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
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography.Title
              level={3}
              style={{
                margin: 0,
                lineHeight: 1.15,
                fontSize: "clamp(22px, 5vw, 26px)",
                fontWeight: 700,
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
                lineHeight: 1.4,
                color: "#6B7280",
                display: "block",
                fontSize: 14,
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
      extra={
        <Button
          type="primary"
          onClick={() => form.submit()}
          aria-label={mode === "create" ? t("common.add") : t("common.save")}
        >
          {mode === "create" ? t("common.add") : t("common.save")}
        </Button>
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
        <Form.Item label={t("wish.form.title.label")} extra={t("wish.sheet.name.extra")}>
          <Form.Item
            name="name"
            noStyle
            rules={[{ required: true, min: 2, message: t("wish.sheet.name.required") }]}
          >
            <Input
              placeholder={t("wish.sheet.name.placeholder")}
              style={{ fontSize: 16 }}
            />
          </Form.Item>
        </Form.Item>

        <Form.Item
          label={t("wish.sheet.images.label")}
          extra={t("wish.sheet.images.extra")}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {activeImages.map((image) => (
              <div
                key={image.id}
                style={{
                  position: "relative",
                  width: 96,
                  height: 96,
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  background: "#f5f5f5",
                }}
              >
                <img
                  src={image.url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Button
                  size="small"
                  type="default"
                  onClick={() => handleRemoveExisting(image)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    padding: "0 6px",
                    background: "rgba(255,255,255,0.85)",
                  }}
                >
                  {t("common.remove")}
                </Button>
              </div>
            ))}
            <Upload
              accept="image/*"
              multiple
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={handleBeforeUpload}
            >
              {activeImages.length + fileList.length >= MAX_TOTAL_IMAGES ? null : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <PlusOutlined />
                  <span style={{ fontSize: 12 }}>
                    {t("wish.sheet.images.add")}
                  </span>
                </div>
              )}
            </Upload>
          </div>
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

      </Form>
    </Drawer>
  );
};
