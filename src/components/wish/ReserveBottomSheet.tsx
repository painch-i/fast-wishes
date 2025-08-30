import React, { useEffect, useState } from "react";
import { Button, Drawer, Form, Input, message } from "antd";
import type { Wish } from "./types";
import { useTranslation } from "react-i18next";
import { supabaseClient } from "../../utility";

interface ReserveBottomSheetProps {
  open: boolean;
  wish: Wish | null;
  onClose: () => void;
  onReserved?: (wishId: number) => void;
  autoSubmitIfPrefilled?: boolean;
}

export const ReserveBottomSheet: React.FC<ReserveBottomSheetProps> = ({
  open,
  wish,
  onClose,
  onReserved,
  autoSubmitIfPrefilled,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  // Prefill from the same source as Settings => You (Supabase auth user)
  useEffect(() => {
    const prefill = async () => {
      try {
        const { data } = await supabaseClient.auth.getUser();
        const meta = (data.user?.user_metadata as any) || {};
        const preferredEmail = meta.contact_email || data.user?.email || undefined;
        form.setFieldsValue({
          name: meta.name || undefined,
          email: preferredEmail,
        });
        if (autoSubmitIfPrefilled && (meta.name || "").trim()) {
          // Auto-submit without asking again if we already have user's name
          handleReserve();
        }
      } catch {
        // ignore prefill errors silently
      }
    };
    if (open) prefill();
  }, [open, form, autoSubmitIfPrefilled]);

  const handleReserve = async () => {
    if (!wish) return;
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      // Ensure we have an authenticated (possibly anonymous) user
      let { data: userData } = await supabaseClient.auth.getUser();
      if (!userData?.user) {
        const { data: anon } = await supabaseClient.auth.signInAnonymously();
        userData = anon as any;
      }
      const userId = userData?.user?.id;
      if (!userId) throw new Error("no-user");

      // Store name/email in auth metadata to keep minimal contact info
      await supabaseClient.auth.updateUser({
        data: { name: values.name || null, contact_email: values.email || null },
      });

      // Insert reservation row
      const { error } = await (supabaseClient as any).from("reservations").insert({
        user_id: userId,
        wish_id: wish.id,
      });
      if (error) throw error;

      message.success(t("public.reserve.toast.reserved"));
      onReserved?.(wish.id);
      onClose();
    } catch (e) {
      // Keep errors subtle; validation errors already surfaced by Form
      if ((e as any)?.message !== "Validation failed") {
        message.error("Oups, impossible de réserver. Réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      destroyOnClose
      title={wish?.name}
    >
      <p>{t("public.reserve.surprise")}</p>
      <Form
        layout="vertical"
        form={form}
        onFinish={handleReserve}
      >
        <Form.Item
          name="name"
          label={t("public.reserve.labels.name")}
          rules={[{ required: true, message: t("public.reserve.errors.nameRequired") }]}
        >
          <Input autoComplete="given-name" />
        </Form.Item>
        <Form.Item
          name="email"
          label={t("public.reserve.labels.email")}
          rules={[{ type: "email", message: t("public.reserve.errors.emailInvalid") }]}
        >
          <Input type="email" autoComplete="email" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting} disabled={submitting}>
            {t("public.reserve.buttons.confirm")}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
