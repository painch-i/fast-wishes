import { useForm, useGetIdentity } from "@refinedev/core";
import { UserIdentity } from "../../types";
import { useTranslation } from "react-i18next";

export const NewWishPage = () => {
  const { onFinish, mutation } = useForm({
    action: "create",
    resource: "wishes",
  });

  const { data: identity } = useGetIdentity<UserIdentity>();
  const { t } = useTranslation();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!identity) {
      throw new Error('Cannot create with if not authenticated')
    }
    event.preventDefault();
    // Using FormData to get the form values and convert it to an object.
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    
    
    // Calling onFinish to submit with the data we've collected from the form.
    onFinish({
      ...data,
      "user_id": identity.id,
      "is_public": true,
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="name">{t("common.name")}</label>
      <input type="text" id="name" name="name" />

      <label htmlFor="description">{t("common.description")}</label>
      <textarea id="description" name="description" />

      {mutation.isSuccess && <span>{t("wish.new.success")}</span>}
      <button type="submit">{t("common.submit")}</button>
    </form>
  );
};