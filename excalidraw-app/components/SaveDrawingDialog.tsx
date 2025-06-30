import React, { useState } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { t } from "@excalidraw/excalidraw/i18n";

interface SaveDrawingDialogProps {
  onClose: () => void;
  onSave: (name: string) => void;
  initialName: string;
}

export const SaveDrawingDialog: React.FC<SaveDrawingDialogProps> = ({
  onClose,
  onSave,
  initialName,
}) => {
  const [name, setName] = useState(initialName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
    onClose();
  };

  return (
    <Dialog onCloseRequest={onClose} title={t("buttons.saveAs")}>
      <div className="SaveDrawingDialog">
        <div className="SaveDrawingDialog-name">
          <label htmlFor="drawing-name">{t("labels.name")}</label>
          <input
            type="text"
            id="drawing-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />
        </div>
        <div className="SaveDrawingDialog-actions">
          <button onClick={onClose}>{t("buttons.cancel")}</button>
          <button onClick={handleSave} disabled={!name.trim()}>
            {t("buttons.save")}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
