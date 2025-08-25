import { useState } from "react";
import { Input, Button, Space } from "antd";
import { useTranslation } from "react-i18next";

export type QuickAddBarProps = {
  onAdd: (url?: string) => void;
};

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAdd }) => {
  const [link, setLink] = useState("");
  const { t } = useTranslation();

  const handleSubmit = () => {
    onAdd(link);
    setLink("");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "#fff",
        padding: 12,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Space>
        <Input
          placeholder={t("wish.quickAdd.placeholder")}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          size="large"
          style={{ width: 260 }}
        />
        <Button type="primary" size="large" onClick={handleSubmit}>
          {t("wish.quickAdd.add")}
        </Button>
      </Space>
    </div>
  );
};
