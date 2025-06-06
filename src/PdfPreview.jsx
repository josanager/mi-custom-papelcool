import React, { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import 'pdfjs-dist/web/pdf_viewer.css';

// Configura el worker de PDF.js
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${require('pdfjs-dist/package.json').version}/pdf.worker.min.js`;

export default function PdfPreview({ pdfBlobUrl, width = 420, height = 260 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pdfBlobUrl) return;
    setError(null);
    setLoading(true);
    let pdfDoc = null;
    let renderTask = null;
    getDocument(pdfBlobUrl).promise
      .then(doc => {
        pdfDoc = doc;
        return doc.getPage(1);
      })
      .then(page => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const viewport = page.getViewport({ scale: 1 });
        // Ajusta el tamaño del canvas al contenedor
        const scale = Math.min(width / viewport.width, height / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const ctx = canvas.getContext('2d');
        renderTask = page.render({ canvasContext: ctx, viewport: scaledViewport });
        return renderTask.promise;
      })
      .then(() => setLoading(false))
      .catch(err => {
        setError('No se pudo mostrar la vista previa del PDF.');
        setLoading(false);
      });
    return () => {
      if (renderTask) renderTask.cancel();
      if (pdfDoc) pdfDoc.destroy();
    };
  }, [pdfBlobUrl, width, height]);

  return (
    <div
      style={{ width, height, background: '#eee', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, cursor: 'default' }}
      onContextMenu={e => e.preventDefault()}
    >
      {error && <div style={{ color: '#c00', fontWeight: 700, textAlign: 'center' }}>{error}</div>}
      {loading && !error && <div style={{ color: '#888', fontWeight: 700, fontSize: 16 }}>Cargando vista previa del PDF…</div>}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'default', userSelect: 'none', pointerEvents: 'none' }} tabIndex={-1} />
    </div>
  );
} 