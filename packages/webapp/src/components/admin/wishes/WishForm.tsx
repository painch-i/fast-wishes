import type { FormInstance } from "antd";
import { Form, Input, Segmented, Select, Switch, Typography } from "antd";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useWishMetadata } from "../../../hooks/useWishMetadata";
import { WishUI } from "../../../types/wish";

const { TextArea } = Input;

export type WishFormProps = {
  initialValues?: Partial<WishUI>;
  onSubmit: (values: WishUI) => void;
  form: FormInstance;
};

export const WishForm: React.FC<WishFormProps> = ({ initialValues, onSubmit, form }) => {
  const { control, handleSubmit, watch, setValue } = useForm<WishUI>({
    defaultValues: { priority: 2, ...initialValues },
  });
  const { t } = useTranslation();

  const url = watch("url");
  const { metadata } = useWishMetadata(url ?? undefined);

  useEffect(() => {
    if (metadata?.title && !watch("name")) {
      setValue("name", metadata.title);
    }
  }, [metadata, watch, setValue]);

  const handleInternalSubmit = (values: WishUI) => {
    const priceNumber =
      values.price != null && values.price !== ""
        ? Number.parseFloat(String(values.price).replace(",", "."))
        : Number.NaN;
    const normalizedPrice = Number.isFinite(priceNumber)
      ? priceNumber.toFixed(2)
      : null;
    onSubmit({
      ...values,
      price: normalizedPrice,
    });
  };

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit(handleInternalSubmit)}>
      {/* Emoji + Title */}
      <Form.Item label={t("wish.form.title.label")} required>
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Input size="large" {...field} value={field.value ?? ""} placeholder={t("wish.form.title.label")} />
          )}
        />
      </Form.Item>
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
        name="price"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.price.label")}>
            <Input size="large" type="text" inputMode="decimal" {...field} value={field.value ?? ""} />
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
        name="priority"
        control={control}
        render={({ field }) => (
          <Form.Item label={t("wish.form.priority.label")}>
            <Segmented {...field} options={[1, 2, 3]} />
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
