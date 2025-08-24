import React, { useState, useRef, useEffect } from "react";
import { Tag, Input, Space } from "antd";
import type { InputRef } from "antd";

const SUGGESTIONS = [
  "Maison",
  "Cuisine",
  "Sport",
  "Lecture",
  "Tech",
  "Mode",
  "Beauté",
  "Jeux",
  "Bébé",
  "Voyage",
];

export interface CategorySelectorProps {
  value?: string[];
  onChange?: (value: string[]) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value = [],
  onChange,
}) => {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const addCategory = (name: string) => {
    let formatted = name.trim();
    if (!formatted) return;
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
    if (value.includes(formatted) || value.length >= 3) return;
    const next = [...value, formatted];
    onChange?.(next);
  };

  const handleInputConfirm = () => {
    addCategory(inputValue);
    setInputValue("");
    setInputVisible(false);
  };

  const handleDelete = (cat: string) => {
    onChange?.(value.filter((v) => v !== cat));
  };

  const suggestions = SUGGESTIONS.filter(
    (s) => s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  );

  const showCreate =
    inputValue && !suggestions.some((s) => s.toLowerCase() === inputValue.toLowerCase());

  return (
    <div>
      <Space size={[8, 8]} wrap>
        {value.map((cat) => (
          <Tag
            key={cat}
            closable
            onClose={() => handleDelete(cat)}
            closeIcon={<span aria-label={`Retirer ${cat}`}>×</span>}
            style={{
              padding: "8px 12px",
              height: 44,
              lineHeight: "28px",
              cursor: "default",
            }}
          >
            {cat}
          </Tag>
        ))}
        {value.length < 3 && !inputVisible && (
          <Tag
            onClick={() => setInputVisible(true)}
            style={{
              borderStyle: "dashed",
              padding: "8px 12px",
              height: 44,
              lineHeight: "28px",
              cursor: "pointer",
            }}
            aria-label="Ajouter une catégorie"
          >
            + Ajouter une catégorie
          </Tag>
        )}
        {inputVisible && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleInputConfirm}
            onBlur={handleInputConfirm}
            placeholder="Ex. Maison, Cuisine, Sport…"
            style={{ width: 200, height: 44 }}
          />
        )}
      </Space>
      {inputVisible && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            overflowX: "auto",
          }}
        >
          {suggestions.map((s) => (
            <Tag
              key={s}
              onMouseDown={(e) => {
                e.preventDefault();
                addCategory(s);
                setInputValue("");
                setInputVisible(false);
              }}
              style={{
                padding: "8px 12px",
                height: 44,
                lineHeight: "28px",
                cursor: "pointer",
              }}
            >
              {s}
            </Tag>
          ))}
          {showCreate && (
            <Tag
              onMouseDown={(e) => {
                e.preventDefault();
                addCategory(inputValue);
                setInputValue("");
                setInputVisible(false);
              }}
              style={{
                padding: "8px 12px",
                height: 44,
                lineHeight: "28px",
                cursor: "pointer",
              }}
            >
              {`Créer « ${inputValue} »`}
            </Tag>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySelector;
