import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input, InputNumber, Select, Switch, Segmented, Form, Typography } from "antd";
import type { FormInstance } from "antd";
import { WishUI } from "../../../types/wish";
import { useWishMetadata } from "../../../hooks/useWishMetadata";

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

  const url = watch("url");
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
      <Controller
        name="name"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <Form.Item label="Titre" required>
              <Input size="large" {...field} value={field.value ?? ""} />
          </Form.Item>
        )}
      />
      <Controller
        name="url"
        control={control}
        render={({ field }) => (
          <Form.Item label="URL">
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
          <Form.Item label="Image URL">
              <Input size="large" {...field} value={field.value ?? ""} />
          </Form.Item>
        )}
      />
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <Form.Item label="Prix">
            <InputNumber min={0} style={{ width: "100%" }} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <Form.Item label="Devise">
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
          <Form.Item label="Description">
              <TextArea rows={3} {...field} value={field.value ?? ""} />
          </Form.Item>
        )}
      />
      <Controller
        name="quantity"
        control={control}
        render={({ field }) => (
          <Form.Item label="Quantité">
            <InputNumber min={1} style={{ width: "100%" }} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <Form.Item label="Priorité">
            <Segmented {...field} options={[1, 2, 3]} />
          </Form.Item>
        )}
      />
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <Form.Item label="Tags">
            <Select mode="tags" tokenSeparators={[","]} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="note_private"
        control={control}
        render={({ field }) => (
          <Form.Item label="Note privée">
            <TextArea rows={3} {...field} />
          </Form.Item>
        )}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Form.Item label="Statut">
            <Select {...field} options={["draft", "available", "reserved", "received", "archived"].map(v => ({ value: v }))} />
          </Form.Item>
        )}
      />
      <Controller
        name="is_public"
        control={control}
        render={({ field }) => (
          <Form.Item label="Public ?" valuePropName="checked">
            <Switch {...field} />
          </Form.Item>
        )}
      />
    </Form>
  );
};
