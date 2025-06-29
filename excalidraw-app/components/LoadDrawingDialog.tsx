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

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que quieres borrar el dibujo '${name}'?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/drawings/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setDrawings(drawings.filter((drawing) => drawing._id !== id));
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error al borrar el dibujo.");
        }
      } catch (err: any) {
        setError(err.message);
      }
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
              <li key={drawing._id} className="drawing-item">
                <div onClick={() => handleLoadClick(drawing._id)}>
                  <div className="drawing-name">{drawing.name || "Dibujo sin nombre"}</div>
                  <div className="drawing-date">{new Date(drawing.updatedAt).toLocaleString()}</div>
                </div>
                <button
                  className="danger-button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent loading when clicking delete
                    handleDeleteClick(drawing._id, drawing.name);
                  }}
                >
                  {t("buttons.delete")}
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
