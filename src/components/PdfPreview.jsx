import React, { useEffect, useRef, useState } from 'react';
import { pdfjs } from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Configurar la ruta del worker para Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export default function PdfPreview({ pdfBlobUrl, width = 420, height = 260 }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfBlobUrl) return;
    setLoading(true);
    setError(null);

    let pdfDoc = null;
    let renderTask = null;
    let cancelled = false;

    const loadingTask = pdfjs.getDocument(pdfBlobUrl);
    loadingTask.promise
      .then(doc => {
        pdfDoc = doc;
        return doc.getPage(1);
      })
      .then(page => {
        if (cancelled) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.0 });
        // Ajustar el tamaño del canvas al contenedor
        const scale = Math.min(width / viewport.width, height / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const renderContext = { canvasContext: context, viewport: scaledViewport };
        renderTask = page.render(renderContext);
        return renderTask.promise;
      })
      .then(() => {
        if (!cancelled) setLoading(false);
      })
      .catch(err => {
        if (!cancelled) {
          setError('No se pudo cargar la vista previa del PDF.');
          setLoading(false);
        }
      });

    // Cleanup: cancelar la carga si el componente se desmonta
    return () => {
      cancelled = true;
      if (renderTask) renderTask.cancel();
      if (pdfDoc) pdfDoc.destroy();
      loadingTask.destroy();
    };
  }, [pdfBlobUrl, width, height]);

  return (
    <div
      className="pdf-preview-wrapper"
      style={{
        width,
        height,
        background: '#eee',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        cursor: 'default',
        userSelect: 'none'
      }}
      onContextMenu={e => e.preventDefault()}
    >
      {error && (
        <div style={{ color: '#c00', fontWeight: 700, textAlign: 'center' }}>
          {error}
        </div>
      )}
      {loading && !error && (
        <div style={{ color: '#888', fontWeight: 700, fontSize: 16 }}>
          Cargando vista previa del PDF…
        </div>
      )}
      {!loading && !error && (
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'default',
            userSelect: 'none'
          }}
          onContextMenu={e => e.preventDefault()}
          tabIndex={-1}
        />
      )}
    </div>
  );
} 