import React, { useState, useEffect } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { t } from "@excalidraw/excalidraw/i18n";

interface Drawing {
  _id: string;
  name: string;
  updatedAt: string;
}

interface LoadDrawingDialogProps {
  onClose: () => void;
  onLoad: (drawing: any) => void;
}

export const LoadDrawingDialog: React.FC<LoadDrawingDialogProps> = ({
  onClose,
  onLoad,
}) => {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/drawings");
        if (response.ok) {
          const data = await response.json();
          setDrawings(data);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al cargar los dibujos.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDrawings();
  }, []);

  const handleLoadClick = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/drawings/${id}`);
      if (response.ok) {
        const drawing = await response.json();
        onLoad(drawing);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar el dibujo.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog onCloseRequest={onClose} className="LoadDrawingDialog" title={t("buttons.load")}>
      <div className="Dialog__content">
        {loading && <p>Cargando dibujos...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {!loading && drawings.length === 0 && !error && (
          <p>No hay dibujos guardados.</p>
        )}
        {!loading && drawings.length > 0 && (
          <ul>
            {drawings.map((drawing) => (
              <li key={drawing._id}>
                <span>{drawing.name || "Dibujo sin nombre"}</span>
                <span> ({new Date(drawing.updatedAt).toLocaleString()})</span>
                <button onClick={() => handleLoadClick(drawing._id)}>
                  Cargar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="Dialog__actions">
        <button onClick={onClose}>{t("buttons.cancel")}</button>
      </div>
    </Dialog>
  );
};
