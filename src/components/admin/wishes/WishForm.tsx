import type { FormInstance } from "antd";
import { Button, Form, Input, InputNumber, Segmented, Select, Space, Switch, Typography } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useWishMetadata } from "../../../hooks/useWishMetadata";
import { WishUI } from "../../../types/wish";
import { EmojiPickerPopover } from "./EmojiPickerPopover";

const { TextArea } = Input;

export type WishFormProps = {
  initialValues?: Partial<WishUI>;
  onSubmit: (values: WishUI) => void;
  form: FormInstance;
};

export const WishForm: React.FC<WishFormProps> = ({ initialValues, onSubmit, form }) => {
  const { control, handleSubmit, watch, setValue } = useForm<WishUI>({
    defaultValues: { quantity: 1, priority: 2, ...initialValues },
  });
  const { t } = useTranslation();

  const url = watch("url");
  const emoji = watch("emoji");
  const { metadata } = useWishMetadata(url ?? undefined);

  useEffect(() => {
    if (metadata?.title && !watch("name")) {
      setValue("name", metadata.title);
    }
    if (metadata?.image && !watch("image_url")) {
      setValue("image_url", metadata.image);
    }
  }, [metadata, watch, setValue]);

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit(onSubmit)}>
      {/* Emoji + Title */}
      <Form.Item label={t("wish.form.title.label")} required>
        <Space.Compact style={{ width: "100%" }}>
          <EmojiPickerPopover
            value={emoji ?? undefined}
            onChange={(em) => setValue("emoji", (em as any) ?? null, { shouldDirty: true, shouldTouch: true })}
          />
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Input size="large" {...field} value={field.value ?? ""} placeholder={t("wish.form.title.label")} />
            )}
          />
        </Space.Compact>
      </Form.Item>
      {/* keep hidden field wired to RHF for emoji value in submission */}
      <Controller
        name="emoji"
        control={control}
        render={({ field }) => <input type="hidden" {...field} value={field.value ?? ""} />}
      />
      <Controller
        name="url"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.url.label")}>
              <Input size="large" {...field} value={field.value ?? ""} />
          </Form.Item>
        )}
      />
      {metadata && (
        <Typography.Text type="secondary">{metadata.site_name}</Typography.Text>
      )}
      <Controller
        name="image_url"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.image.label")}>
              <Input size="large" {...field} value={field.value ?? ""} />
          </Form.Item>
        )}
      />
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.price.label")}>
            <InputNumber min={0} style={{ width: "100%" }} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.currency.label")}>
            <Select
              {...field}
              options={[field.value, "EUR", "USD", "GBP"]
                .filter((v): v is string => !!v)
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .map((v) => ({ value: v }))}
            />
          </Form.Item>
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.description.label")}>
              <TextArea rows={3} {...field} value={field.value ?? ""} />
          </Form.Item>
        )}
      />
      <Controller
        name="quantity"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.quantity.label")}>
            <InputNumber min={1} style={{ width: "100%" }} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.priority.label")}>
            <Segmented {...field} options={[1, 2, 3]} />
          </Form.Item>
        )}
      />
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.tags.label")}>
            <Select mode="tags" tokenSeparators={[","]} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="note_private"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.notePrivate.label")}>
            <TextArea rows={3} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.status.label")}>
            <Select {...field} options={["draft", "available", "reserved", "received", "archived"].map(v => ({ value: v, label: t(`wish.status.${v}`) }))} />
          </Form.Item>
        )}
      />
      <Controller
        name="is_public"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.isPublic.label")} valuePropName="checked">
            <Switch {...field} />
          </Form.Item>
        )}
      />
    </Form>
  );
};
