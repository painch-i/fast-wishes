import { Button, Drawer, Form, Input, message } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabaseClient } from "../../utility";
import type { Wish } from "./types";

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


  const handleReserve = useCallback(async () => {
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

      // Store name/email auth email
      if (values.email) {
        await supabaseClient.auth.updateUser({
          email: values.email,
        });
      }

      // Insert reservation row
      if (values.name) {
        const { error: updateUserError } = await supabaseClient.from("users").update({ name: values.name,  }).eq('id', userId);
        if (updateUserError) throw updateUserError;
      }

      // Insert reservation row
      const { error } = await supabaseClient.from("reservations").insert({
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
  }, [form, onClose, onReserved, t, wish]);

  // Prefill from the same source as Settings => You (Supabase auth user)
  useEffect(() => {
    const prefill = async () => {
      try {
        const { data: authData } = await supabaseClient.auth.getUser();
        const userData = authData?.user?.id ? await supabaseClient.from('users').select('name').eq('id', authData.user.id).limit(1) : undefined;
        const name = userData?.data?.[0].name || '';
        const email = authData.user?.email || '';
        form.setFieldsValue({
          name,
          email,
        });
        if (autoSubmitIfPrefilled && (name || "").trim()) {
          // Auto-submit without asking again if we already have user's name
          handleReserve();
        }
      } catch {
        // ignore prefill errors silently
      }
    };
    if (open) prefill();
  }, [open, form, autoSubmitIfPrefilled, handleReserve]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      destroyOnClose
      title={wish?.name}
      extra={
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={submitting}
          disabled={submitting}
        >
          {t("public.reserve.buttons.confirm")}
        </Button>
      }
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
      </Form>
    </Drawer>
  );
};
