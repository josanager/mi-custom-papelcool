// src/App.jsx
import * as THREE from 'three'
import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

// → Aquí añades los de jsPDF y tu helper/template
import { jsPDF } from 'jspdf'
import { TEMPLATE_LAYOUT } from './templateLayout'
import { loadImage } from './utils/loadImage'

import Hair from './Hair'
import Eyes from './Eyes'
import Noses from './Noses'
import Eyebrows from './Eyebrows'
import Ears from './Ears'
import FacialHair from './FacialHair'
import Torso from './Torso'
import Arms from './Arms'

import './App.css'
import { useViewport } from './hooks/useViewport'

// Opciones de cada parte
const HAIR_VARIANTS      = Array.from({ length: 11 }, (_, i) => `hair${i+1}`)
const EYE_STYLES         = { male: Array.from({ length: 10 }, (_, i) => `eye${i+1}`), female: Array.from({ length: 10 }, (_, i) => `eye${i+1}`) }
const NOSE_STYLES        = Array.from({ length: 6 }, (_, i) => `nose${i+1}`)
const EYEBROW_STYLES     = Array.from({ length: 4 }, (_, i) => `eyebrow${i+1}`)
const EAR_STYLES         = Array.from({ length: 2 }, (_, i) => `ear${i+1}`)
const FACIAL_HAIR_STYLES = ['none','beard1','beard2','beard3','beard4']
const TORSO_STYLES       = Array.from({ length: 18 }, (_, i) => `torso${i+1}`)
const ARMS_STYLES        = Array.from({ length: 5 }, (_, i) => `arms${i+1}`)
const BACKGROUNDS        = Array.from({ length: 4 }, (_, i) => `fondo${i+1}`) // Pon fondo1.png…fondo4.png en public/backgrounds/

// Modelo base
function PapercoolModel({ colors }) {
  const { scene } = useGLTF('/models/papelcool.glb')
  scene.traverse(obj => {
    if (obj.isMesh) {
      const map = obj.material.map
      obj.material.dispose()
      obj.material = new THREE.MeshStandardMaterial({
        color: colors[obj.name] ?? 0xffffff,
        map,
        roughness: 0.5,
        metalness: 0
      })
    }
  })
  return <primitive object={scene} />
}

export default function App() {
  const [step, setStep] = useState(0)  // 0..11

  // Estados de color y partes
  const [colors,      setColors]      = useState({
    Head:'#ffffff', Torso:'#ffffff',
    Arm_L:'#ffffff', Arm_R:'#ffffff',
    Leg_L:'#ffffff', Leg_R:'#ffffff',
  })
  const [globalColor, setGlobalColor] = useState('#ffffff')
  const [hairstyle,   setHairstyle]   = useState(HAIR_VARIANTS[0])
  const [eyeGender,   setEyeGender]   = useState('male')
  const [eyeStyle,    setEyeStyle]    = useState(EYE_STYLES.male[0])
  const [noseStyle,   setNoseStyle]   = useState(NOSE_STYLES[0])
  const [eyebrowStyle,setEyebrowStyle]= useState(EYEBROW_STYLES[0])
  const [earLeft,     setEarLeft]     = useState(EAR_STYLES[0])
  const [earRight,    setEarRight]    = useState(EAR_STYLES[0])
  const [facialHair,  setFacialHair]  = useState(FACIAL_HAIR_STYLES[0])
  const [torsoStyle,  setTorsoStyle]  = useState(TORSO_STYLES[0])
  const [armsStyle,   setArmsStyle]   = useState(ARMS_STYLES[0])
  const [bgStyle,     setBgStyle]     = useState(BACKGROUNDS[0])

  // Colores preestablecidos para el color general
  const PRESET_COLORS = ['#FBC694', '#FEDEBC', '#B99B80'];

  // Aplica color global
  const applyGlobalColor = () =>
    setColors(prev =>
      Object.fromEntries(Object.keys(prev).map(k => [k, globalColor]))
    )

  // Estilo base para todos los botones
  const btnBase = {
    padding: '1.1em 2.2em',
    border: 'none',
    borderRadius: 32,
    background: '#fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    fontFamily: 'Montserrat, Arial, sans-serif',
    fontWeight: 900,
    fontSize: '1.2rem',
    color: '#222',
    letterSpacing: 1,
    transition: 'background 0.35s cubic-bezier(0.4,0,0.2,1), color 0.3s, box-shadow 0.3s, opacity 0.3s, transform 0.22s cubic-bezier(0.4,0,0.2,1)',
    opacity: 0.92,
  };

  const MAX_STEP = 11

  // Define fondo: gradient en pasos <10, imagen en paso 10
  const wrapperBg =
    step < MAX_STEP
      ? 'linear-gradient(135deg, #00FF38, #00AA70)'
      : `url(/backgrounds/${bgStyle}.png) center center / cover no-repeat`

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isPortraitMobile } = useViewport();

  // Clases dinámicas
  const wrapperClass = isPortraitMobile
    ? 'wrapper-portrait'
    : sidebarOpen
      ? 'wrapper sidebar-open'
      : 'wrapper';

  const canvasClass = `canvas-container ${
    isPortraitMobile && sidebarOpen && step >= 1 && step <= 9
      ? 'sidebar-open step-1to9'
      : ''
  }`;

  // Posición del botón toggle
  const toggleBtnLeft = !isPortraitMobile && sidebarOpen
    ? 'var(--sidebar-width-desktop)'
    : '18px';

  // Partes del modelo para el menú de colores
  const COLOR_PARTS = [
    { key: 'Head', label: 'CABEZA', img: '/placeholder_head.png' },
    { key: 'Torso', label: 'TORSO', img: '/placeholder_torso.png' },
    { key: 'Arm_L', label: 'BRAZO IZ.', img: '/placeholder_arm_left.png' },
    { key: 'Arm_R', label: 'BRAZO DE.', img: '/placeholder_arm_right.png' },
    { key: 'Leg_L', label: 'PIERNA IZ.', img: '/placeholder_leg_left.png' },
    { key: 'Leg_R', label: 'PIERNA DE.', img: '/placeholder_leg_right.png' },
  ];

  // dentro de App, antes de handleDownloadTemplate:
const getImageUrlForLayer = (name) => {
  switch (name) {
    case 'hair':
      return `/hair/${hairstyle}.png`;
    case 'eyes':
      return `/eyes/${eyeGender}/${eyeStyle}.png`;
    case 'nose':
      return `/noses/${noseStyle}.png`;
    case 'eyebrows':
      return `/eyebrows/${eyebrowStyle}.png`;
    case 'ears_left':
      return `/ears/${earLeft}_left.png`;
    case 'ears_right':
      return `/ears/${earRight}_right.png`;
    case 'facialhair':
      return facialHair !== 'none' ? `/facialhair/${facialHair}.png` : null;
    case 'torso_front':
      return `/torso/${torsoStyle}_front.png`;
    case 'torso_back':
      return `/torso/${torsoStyle}_back.png`;
    case 'arms_front':
      return `/arms/${armsStyle}_front.png`;
    case 'arms_back':
      return `/arms/${armsStyle}_back.png`;
    default:
      return null;
  }
}
  
  // dentro de App()
  const handleDownloadTemplate = async () => {
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
      const MM_TO_PX = 3.78; // 1 mm ≈ 3.78 px (96 DPI)
for (const layer of TEMPLATE_LAYOUT) {
        // No incluir backgrounds
        if (layer.name.startsWith('fondo') || layer.name.startsWith('background')) continue;
        const imageUrl = getImageUrlForLayer(layer.name) || layer.file;
        if (!imageUrl) continue;
        const img = await loadImage(imageUrl);
        // Si es un net (máscara base)
        if (layer.file && layer.file.startsWith('/nets/')) {
          // Canvas del tamaño original de la imagen
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
  if (layer.name === 'guia') {
            ctx.drawImage(img, 0, 0);
  } else {
            // Pintar color base según la parte
    const colorMap = {
      head:        colors.Head,
      torso:       colors.Torso,
      arm_left:    colors.Arm_L,
      arm_right:   colors.Arm_R,
      leg_left:    colors.Leg_L,
      leg_right:   colors.Leg_R,
              // ... puedes añadir más si agregas más nets
            };
            ctx.fillStyle = colorMap[layer.name] || '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(img, 0, 0);
          }
          const dataUrl = canvas.toDataURL('image/png');
          pdf.addImage(
            dataUrl,
            'PNG',
            layer.x ?? 0,
            layer.y ?? 0,
            layer.w ?? img.width / MM_TO_PX,
            layer.h ?? img.height / MM_TO_PX,
            undefined,
            undefined,
            layer.rotation ?? 0
          );
        } else {
          // Asset personalizado: canvas pequeño redimensionado, pero con el doble de resolución para mejor calidad
          const wPx = Math.round((layer.w ?? img.width / MM_TO_PX) * MM_TO_PX * 3); // 3x resolución
          const hPx = Math.round((layer.h ?? img.height / MM_TO_PX) * MM_TO_PX * 3); // 3x resolución
          const canvas = document.createElement('canvas');
          canvas.width = wPx;
          canvas.height = hPx;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, wPx, hPx);
          const dataUrl = canvas.toDataURL('image/png');
  pdf.addImage(
    dataUrl,
    'PNG',
            layer.x ?? 0,
            layer.y ?? 0,
            layer.w ?? img.width / MM_TO_PX,
            layer.h ?? img.height / MM_TO_PX,
            undefined,
            undefined,
            layer.rotation ?? 0
          );
        }
      }
      pdf.save('plantilla-papelcool.pdf');
    } catch (e) {
      console.error('Error generando PDF:', e);
    }
  }

  // Estado para el código de descarga y error
  const [downloadCode, setDownloadCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isCodeValid, setIsCodeValid] = useState(false);

  // Función para validar el código (mock)
  const validateCode = () => {
    if (downloadCode.trim() === '123456789') {
      setIsCodeValid(true);
      setCodeError('');
    } else {
      setIsCodeValid(false);
      setCodeError('Código incorrecto.');
    }
  };

  // Estado para el canvas de preview y carga
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Generar la vista previa de la plantilla con marca de agua
  const generatePreview = async () => {
    setPreviewLoading(true);
    // Tamaño A4 horizontal en px (proporcional a PDF)
    const MM_TO_PX = 4; // más resolución para preview
    const widthPx = Math.round(297 * MM_TO_PX);
    const heightPx = Math.round(210 * MM_TO_PX);
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // Dibuja cada layer igual que en el PDF
    for (const layer of TEMPLATE_LAYOUT) {
      if (layer.name.startsWith('fondo') || layer.name.startsWith('background')) continue;
      const imageUrl = getImageUrlForLayer(layer.name) || layer.file;
      if (!imageUrl) continue;
      try {
        const img = await loadImage(imageUrl);
        // Si es un net (máscara base)
        if (layer.file && layer.file.startsWith('/nets/')) {
          // Pintar color base según la parte
          const colorMap = {
            head:        colors.Head,
            torso:       colors.Torso,
            arm_left:    colors.Arm_L,
            arm_right:   colors.Arm_R,
            leg_left:    colors.Leg_L,
            leg_right:   colors.Leg_R,
          };
          ctx.save();
          ctx.translate((layer.x ?? 0) * MM_TO_PX, (layer.y ?? 0) * MM_TO_PX);
          if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.fillStyle = colorMap[layer.name] || '#fff';
          ctx.fillRect(0, 0, (layer.w ?? img.width / MM_TO_PX) * MM_TO_PX, (layer.h ?? img.height / MM_TO_PX) * MM_TO_PX);
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(img, 0, 0, (layer.w ?? img.width / MM_TO_PX) * MM_TO_PX, (layer.h ?? img.height / MM_TO_PX) * MM_TO_PX);
          ctx.globalCompositeOperation = 'source-over';
          ctx.restore();
        } else {
          // Asset personalizado
          ctx.save();
          ctx.translate((layer.x ?? 0) * MM_TO_PX, (layer.y ?? 0) * MM_TO_PX);
          if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.drawImage(
            img,
            0, 0,
            (layer.w ?? img.width / MM_TO_PX) * MM_TO_PX,
            (layer.h ?? img.height / MM_TO_PX) * MM_TO_PX
          );
          ctx.restore();
        }
      } catch (e) {
        // Si falla una imagen, ignora
        continue;
      }
    }
    // Marca de agua
    ctx.save();
    ctx.translate(widthPx/2, heightPx/2);
    ctx.rotate(-Math.PI/8);
    ctx.font = 'bold 80px Montserrat, Arial, sans-serif';
    ctx.fillStyle = 'rgba(90,90,90,0.18)';
    ctx.textAlign = 'center';
    ctx.fillText('PAPELCOOL - PREVISUALIZACIÓN', 0, 0);
    ctx.restore();
    setPreviewUrl(canvas.toDataURL('image/png'));
    setPreviewLoading(false);
  };

  // Genera la preview al entrar al paso 11
  useEffect(() => {
    if (step === 11) generatePreview();
    // eslint-disable-next-line
  }, [step]);

  // Generador de PDF reutilizable (preview o descarga)
  const generatePdf = async (preview = false) => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    const MM_TO_PX = 3.78;
    for (const layer of TEMPLATE_LAYOUT) {
      if (layer.name.startsWith('fondo') || layer.name.startsWith('background')) continue;
      const imageUrl = getImageUrlForLayer(layer.name) || layer.file;
      if (!imageUrl) continue;
      try {
        const img = await loadImage(imageUrl);
        if (layer.file && layer.file.startsWith('/nets/')) {
          // Canvas del tamaño original de la imagen
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (layer.name === 'guia') {
            ctx.drawImage(img, 0, 0);
          } else {
            const colorMap = {
              head:        colors.Head,
              torso:       colors.Torso,
              arm_left:    colors.Arm_L,
              arm_right:   colors.Arm_R,
              leg_left:    colors.Leg_L,
              leg_right:   colors.Leg_R,
            };
            ctx.fillStyle = colorMap[layer.name] || '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(img, 0, 0);
          }
          const dataUrl = canvas.toDataURL('image/png');
          pdf.addImage(
            dataUrl,
            'PNG',
            layer.x ?? 0,
            layer.y ?? 0,
            layer.w ?? img.width / MM_TO_PX,
            layer.h ?? img.height / MM_TO_PX,
            undefined,
            undefined,
            layer.rotation ?? 0
          );
        } else {
          // Asset personalizado
          const wPx = Math.round((layer.w ?? img.width / MM_TO_PX) * MM_TO_PX * 3);
          const hPx = Math.round((layer.h ?? img.height / MM_TO_PX) * MM_TO_PX * 3);
          const canvas = document.createElement('canvas');
          canvas.width = wPx;
          canvas.height = hPx;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, wPx, hPx);
          const dataUrl = canvas.toDataURL('image/png');
          pdf.addImage(
            dataUrl,
            'PNG',
            layer.x ?? 0,
            layer.y ?? 0,
            layer.w ?? img.width / MM_TO_PX,
            layer.h ?? img.height / MM_TO_PX,
            undefined,
            undefined,
            layer.rotation ?? 0
          );
        }
      } catch (e) {
        continue;
      }
    }
    // Marca de agua solo en preview
    if (preview) {
      pdf.setTextColor(180, 180, 180);
      pdf.setFontSize(48);
      pdf.text('PAPELCOOL - PREVISUALIZACIÓN', 50, 100, { angle: 20, opacity: 0.2 });
    }
    return pdf;
  };

  // Estado para PDF de preview (con marca de agua)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfPreviewError, setPdfPreviewError] = useState(null);
  // Estado para PDF real (sin marca de agua)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  // Generar PDF de preview SIEMPRE que entras al paso 11
  useEffect(() => {
    let url = null;
    setPdfPreviewError(null);
    setPdfPreviewUrl(null);
    if (step !== 11) return;
    (async () => {
      try {
        const pdf = await generatePdf(true); // con marca de agua
        const blob = pdf.output('blob');
        url = URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
      } catch (error) {
        setPdfPreviewError('No se pudo generar la vista previa del PDF.');
      }
    })();
    return () => { if (url) URL.revokeObjectURL(url); };
  // eslint-disable-next-line
  }, [step, colors, hairstyle, eyeGender, eyeStyle, noseStyle, eyebrowStyle, earLeft, earRight, facialHair, torsoStyle, armsStyle, bgStyle]);

  // Generar PDF real (sin marca de agua) cuando el usuario presiona 'Descargar plantilla' en el paso 10 (avanza a step 11)
  useEffect(() => {
    let url = null;
    setPdfError(null);
    setPdfBlobUrl(null);
    if (step !== 11) return;
    (async () => {
      try {
        const pdf = await generatePdf(false); // sin marca de agua
        const blob = pdf.output('blob');
        url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
      } catch (error) {
        setPdfError('No se pudo preparar el PDF para descarga.');
      }
    })();
    return () => { if (url) URL.revokeObjectURL(url); };
  // eslint-disable-next-line
  }, [step]);

  // Limpieza del blob real si el usuario abandona el paso 11
  useEffect(() => {
    return () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); };
  }, [pdfBlobUrl]);

  // --- ESTADOS Y REFS PARA MENÚ MÓVIL DE COLOR (paso 1) ---
  const [toastMsg, setToastMsg] = useState('');
  const [toastHide, setToastHide] = useState(false);
  const [selectedGeneral, setSelectedGeneral] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [selectedHead, setSelectedHead] = useState(false);
  const [selectedTorso, setSelectedTorso] = useState(false);
  const [selectedArmR, setSelectedArmR] = useState(false);
  const [selectedArmL, setSelectedArmL] = useState(false);
  const [selectedLegR, setSelectedLegR] = useState(false);
  const [selectedLegL, setSelectedLegL] = useState(false);
  const [canContinue, setCanContinue] = useState(true); // Por defecto true para evitar bloqueo
  const generalPickerRef = useRef();
  const headPickerRef = useRef();
  const torsoPickerRef = useRef();
  const armRPickerRef = useRef();
  const armLPickerRef = useRef();
  const legRPickerRef = useRef();
  const legLPickerRef = useRef();

  // Handlers mínimos para evitar errores (puedes personalizar la lógica luego)
  const handleGeneralPickerClick = () => {
    setSelectedGeneral(true);
    if (generalPickerRef.current) generalPickerRef.current.click();
  };
  const handleGeneralColorChange = e => setGlobalColor(e.target.value);
  const handlePresetColor = (color, idx) => { setGlobalColor(color); setSelectedPreset(idx); };
  const handleHeadPickerClick = () => {
    setSelectedHead(true);
    if (headPickerRef.current) headPickerRef.current.click();
  };
  const handleHeadColorChange = e => setColors(c => ({ ...c, Head: e.target.value }));
  const handleTorsoPickerClick = () => {
    setSelectedTorso(true);
    if (torsoPickerRef.current) torsoPickerRef.current.click();
  };
  const handleTorsoColorChange = e => setColors(c => ({ ...c, Torso: e.target.value }));
  const handleArmRPickerClick = () => {
    setSelectedArmR(true);
    if (armRPickerRef.current) armRPickerRef.current.click();
  };
  const handleArmRColorChange = e => setColors(c => ({ ...c, Arm_R: e.target.value }));
  const handleArmLPickerClick = () => {
    setSelectedArmL(true);
    if (armLPickerRef.current) armLPickerRef.current.click();
  };
  const handleArmLColorChange = e => setColors(c => ({ ...c, Arm_L: e.target.value }));
  const handleLegRPickerClick = () => {
    setSelectedLegR(true);
    if (legRPickerRef.current) legRPickerRef.current.click();
  };
  const handleLegRColorChange = e => setColors(c => ({ ...c, Leg_R: e.target.value }));
  const handleLegLPickerClick = () => {
    setSelectedLegL(true);
    if (legLPickerRef.current) legLPickerRef.current.click();
  };
  const handleLegLColorChange = e => setColors(c => ({ ...c, Leg_L: e.target.value }));
  const handleSiguiente = () => setStep(s => s + 1);

  return (
    <>
      {/* --- PANTALLA INTRO (step === 0) --- */}
      {step === 0 && (
        <div
          className="intro-screen"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'var(--wrapper-bg)',
            zIndex: 100,
          }}
        >
          <h1
            style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 900,
              fontSize: '2.5rem',
              color: '#222',
              letterSpacing: 1,
              marginBottom: 40,
              textAlign: 'center',
              textShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            ¡Crea tu propio papelcool!
          </h1>
          <button
            className="hover-button"
            onClick={() => setStep(1)}
          >
            Comenzar
          </button>
        </div>
      )}

      {/* --- PASOS 1..10 --- */}
      {step > 0 && (
        <>
          {/* VISTA HORIZONTAL (desktop/landscape) */}
          {!isPortraitMobile && (
            <div className="layout-horizontal" style={{ background: wrapperBg }}>
              {/* Panel izquierdo */}
              <aside className="sidebar-horizontal">
          {step === 1 && (
            <>
                    <h1 className="sidebar-title">COLOR</h1>
                    <ul className="list-parts">
                      <li><img src="/icons/general.png" alt="General" /> GENERAL</li>
                      <li><img src="/icons/head.png" alt="Cabeza" /> CABEZA</li>
                      <li><img src="/icons/torso.png" alt="Torso" /> TORSO</li>
                      <li><img src="/icons/arm_left.png" alt="Brazo Iz." /> BRAZO IZ.</li>
                      <li><img src="/icons/arm_right.png" alt="Brazo Der." /> BRAZO DE.</li>
                      <li><img src="/icons/leg_left.png" alt="Pierna Iz." /> PIERNA IZ.</li>
                      <li><img src="/icons/leg_right.png" alt="Pierna Der." /> PIERNA DE.</li>
                    </ul>
            </>
          )}
                {step > 1 && step < 10 && (
                  <>
                    <h1 className="sidebar-title">
                      {step === 2 ? 'CABELLO' :
                       step === 3 ? 'OJOS' :
                       step === 4 ? 'NARIZ' :
                       step === 5 ? 'CEJAS' :
                       step === 6 ? 'OREJAS' :
                       step === 7 ? 'VELLO FACIAL' :
                       step === 8 ? 'TORSO' :
                       step === 9 ? 'BRAZOS' : ''}
                    </h1>
                    <div className="grid-options">
                      {step === 2 && HAIR_VARIANTS.map(hair => (
                        <div key={hair} onClick={() => setHairstyle(hair)} className={`thumb${hairstyle === hair ? ' selected' : ''}`}>
                          <img src={`/hair/${hair}.png`} alt={hair} />
                        </div>
                      ))}
                      {step === 3 && EYE_STYLES[eyeGender].map(eye => (
                        <div key={eye} onClick={() => setEyeStyle(eye)} className={`thumb${eyeStyle === eye ? ' selected' : ''}`}>
                          <img src={`/eyes/${eyeGender}/${eye}.png`} alt={eye} />
            </div>
                      ))}
                      {step === 4 && NOSE_STYLES.map(nose => (
                        <div key={nose} onClick={() => setNoseStyle(nose)} className={`thumb${noseStyle === nose ? ' selected' : ''}`}>
                          <img src={`/noses/${nose}.png`} alt={nose} />
              </div>
                      ))}
                      {step === 5 && EYEBROW_STYLES.map(eyebrow => (
                        <div key={eyebrow} onClick={() => setEyebrowStyle(eyebrow)} className={`thumb${eyebrowStyle === eyebrow ? ' selected' : ''}`}>
                          <img src={`/eyebrows/${eyebrow}.png`} alt={eyebrow} />
            </div>
                      ))}
                      {step === 6 && (
                        <>
                          {/* Oreja izquierda */}
                          {EAR_STYLES.map(ear => (
                            <div key={ear+"_left"} onClick={() => setEarLeft(ear)} className={`thumb${earLeft === ear ? ' selected' : ''}`}>
                              <img src={`/ears/${ear}_left.png`} alt={ear+"_left"} />
            </div>
                          ))}
                          {/* Oreja derecha */}
                          {EAR_STYLES.map(ear => (
                            <div key={ear+"_right"} onClick={() => setEarRight(ear)} className={`thumb${earRight === ear ? ' selected' : ''}`}>
                              <img src={`/ears/${ear}_right.png`} alt={ear+"_right"} />
            </div>
                          ))}
                        </>
          )}
                      {step === 7 && FACIAL_HAIR_STYLES.map(facial => (
                        <div key={facial} onClick={() => setFacialHair(facial)} className={`thumb${facialHair === facial ? ' selected' : ''}`}>
                          {facial === 'none' ? <span style={{color:'#fff',fontWeight:700,fontSize:18}}>Sin barba</span> : <img src={`/facialhair/${facial}.png`} alt={facial} />}
            </div>
                      ))}
                      {step === 8 && TORSO_STYLES.map(torso => (
                        <div key={torso} onClick={() => setTorsoStyle(torso)} className={`thumb${torsoStyle === torso ? ' selected' : ''}`}>
                          <img src={`/torso/${torso}_front.png`} alt={torso} />
            </div>
                      ))}
                      {step === 9 && ARMS_STYLES.map(arms => (
                        <div key={arms} onClick={() => setArmsStyle(arms)} className={`thumb${armsStyle === arms ? ' selected' : ''}`}>
                          <img src={`/arms/${arms}_front.png`} alt={arms} />
            </div>
                      ))}
            </div>
                  </>
          )}
          {step === 10 && (
                  <>
                    <h1 className="sidebar-title">FONDO</h1>
                    <div className="grid-options">
                      {BACKGROUNDS.map(bg => (
                        <div key={bg} onClick={() => setBgStyle(bg)} className={`thumb${bgStyle === bg ? ' selected' : ''}`}>
                          <img src={`/backgrounds/${bg}.png`} alt={bg} />
                        </div>
                      ))}
            </div>
                  </>
          )}
              </aside>
              {/* Área del Canvas 3D */}
              <main className="canvas-area">
                <Canvas
                  style={{ width: '100%', height: '100%' }}
                  camera={{ position: [0, 2, 5], fov: 50 }}
                >
                  <ambientLight intensity={3.1} color={0xffffff} />
                  <directionalLight position={[5, 5, 5]} intensity={1.3} color={0xffffff} />
                  <Suspense fallback={<div className="spinner" />}>
                    <PapercoolModel colors={colors} />
                    {step >= 2 && <Hair url={`/hair/${hairstyle}.png`} />}
                    {step >= 3 && <Eyes url={`/eyes/${eyeGender}/${eyeStyle}.png`} />}
                    {step >= 4 && <Noses url={`/noses/${noseStyle}.png`} />}
                    {step >= 5 && <Eyebrows url={`/eyebrows/${eyebrowStyle}.png`} />}
                    {step >= 6 && <Ears leftStyle={earLeft} rightStyle={earRight} />}
                    {step >= 7 && facialHair !== 'none' && (
                      <FacialHair url={`/facialhair/${facialHair}.png`} />
                    )}
                    {step >= 8 && <Torso style={torsoStyle} />}
                    {step >= 9 && <Arms style={armsStyle} />}
                  </Suspense>
                  <OrbitControls />
                </Canvas>
              </main>
              {/* Botones de navegación bottom-center */}
              <div className="nav-buttons-horizontal">
                {step === 10 ? (
                  <>
                    <button onClick={() => setStep(s => Math.max(1, s - 1))}>Anterior</button>
                    <button onClick={() => setStep(11)}>Descargar plantilla</button>
                  </>
        ) : (
          <>
                    <button onClick={() => setStep(s => Math.max(1, s - 1))}>Anterior</button>
                    <button onClick={() => setStep(s => s + 1)}>Siguiente</button>
          </>
        )}
      </div>
            </div>
          )}

          {/* VISTA VERTICAL (portrait) */}
          {isPortraitMobile && (
            <>
              <div className={wrapperClass} style={{ background: wrapperBg }}>
                <div className={`canvas-container-portrait${sidebarOpen ? ' menu-open' : ''}`}>
        <Canvas
                    style={{ width: '100%', height: '100%' }}
                    camera={{ position: [0, 2, 5], fov: 50 }}
        >
          <ambientLight intensity={3.1} color={0xffffff} />
                    <directionalLight position={[5, 5, 5]} intensity={1.3} color={0xffffff} />
          <Suspense fallback={<div className="spinner" />}>
            <PapercoolModel colors={colors} />
            {step >= 2 && <Hair url={`/hair/${hairstyle}.png`} />}
            {step >= 3 && <Eyes url={`/eyes/${eyeGender}/${eyeStyle}.png`} />}
            {step >= 4 && <Noses url={`/noses/${noseStyle}.png`} />}
            {step >= 5 && <Eyebrows url={`/eyebrows/${eyebrowStyle}.png`} />}
            {step >= 6 && <Ears leftStyle={earLeft} rightStyle={earRight} />}
            {step >= 7 && facialHair !== 'none' && (
              <FacialHair url={`/facialhair/${facialHair}.png`} />
            )}
            {step >= 8 && <Torso style={torsoStyle} />}
            {step >= 9 && <Arms style={armsStyle} />}
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
                {/* Botones de navegación portrait */}
                <div className="nav-buttons-portrait">
                  {step === 10 ? (
                    <>
                      <button onClick={() => setStep(s => Math.max(1, s - 1))}>Anterior</button>
                      <button onClick={() => setStep(11)}>Descargar plantilla</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setStep(s => Math.max(0, s - 1))}>Anterior</button>
                      <button onClick={() => setStep(s => s + 1)}>Siguiente</button>
                    </>
                  )}
                </div>
                {/* Botón toggle menú portrait */}
                <button
                  className="toggle-menu-btn-portrait"
                  onClick={() => setSidebarOpen(o => !o)}
                  aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                  {sidebarOpen ? '⌄' : '⌃'}
                </button>
                {/* Sidebar portrait */}
                {step === 1 && (
                  <div className={`menu-color-movil${sidebarOpen ? '' : ' oculto'}`}
                    style={{height: '60vh', minHeight: 340, maxHeight: 480, position: 'absolute', left: 0, bottom: 0, width: '100vw'}}>
                    <header>COLOR</header>
                    {/* Toast de validación */}
                    {toastMsg && <div className={`toast${toastHide ? ' hide' : ''}`}>{toastMsg}</div>}
                    {/* Sección Color General */}
                    <section className="color-general">
                      <div className="icono-parte"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 17l4-6 4 5 4-7 4 8" stroke="#7FB3FF" strokeWidth="2" fill="none"/></svg></div>
                      <span className="etiqueta-general">GENERAL</span>
                      <div className="selectores-generales">
                        <div className={`circulo-picker${selectedGeneral ? ' selected' : ''}`}
                          onClick={handleGeneralPickerClick} style={{background: globalColor}}/>
                        <input type="color" style={{display:'none'}} ref={generalPickerRef} onChange={handleGeneralColorChange} value={globalColor}/>
                        <div className={`circulo-predeterminado color-verde${selectedPreset === 0 ? ' selected' : ''}`}
                          onClick={() => handlePresetColor('#00FF7F',0)}/>
                        <div className={`circulo-predeterminado color-rojo${selectedPreset === 1 ? ' selected' : ''}`}
                          onClick={() => handlePresetColor('#FF0000',1)}/>
                        <div className={`circulo-predeterminado color-fucsia${selectedPreset === 2 ? ' selected' : ''}`}
                          onClick={() => handlePresetColor('#FF00FF',2)}/>
                      </div>
                    </section>
                    <hr className="divider" />
                    {/* Sección Cabeza y Torso */}
                    <section className="parte-cabeza-torso">
                      <div className="fila-parte">
                        <div style={{display:'flex',alignItems:'center'}}>
                          <div className="icono-parte"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 17l4-6 4 5 4-7 4 8" stroke="#7FB3FF" strokeWidth="2" fill="none"/></svg></div>
                          <span className="texto-parte">CABEZA</span>
                        </div>
                        <div className={`circulo-picker${selectedHead ? ' selected' : ''}`}
                          onClick={handleHeadPickerClick} style={{background: colors.Head}}/>
                        <input type="color" style={{display:'none'}} ref={headPickerRef} onChange={handleHeadColorChange} value={colors.Head}/>
                      </div>
                      <div className="fila-parte">
                        <div style={{display:'flex',alignItems:'center'}}>
                          <div className="icono-parte"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 17l4-6 4 5 4-7 4 8" stroke="#7FB3FF" strokeWidth="2" fill="none"/></svg></div>
                          <span className="texto-parte">TORSO</span>
                        </div>
                        <div className={`circulo-picker${selectedTorso ? ' selected' : ''}`}
                          onClick={handleTorsoPickerClick} style={{background: colors.Torso}}/>
                        <input type="color" style={{display:'none'}} ref={torsoPickerRef} onChange={handleTorsoColorChange} value={colors.Torso}/>
                      </div>
                    </section>
                    <hr className="divider" />
                    {/* Sección Brazos y Piernas */}
                    <section className="parte-extremidades">
                      <div className="fila-parte">
                        <div style={{display:'flex',alignItems:'center'}}>
                          <div className="icono-parte"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 17l4-6 4 5 4-7 4 8" stroke="#7FB3FF" strokeWidth="2" fill="none"/></svg></div>
                          <span className="texto-parte">BRAZO DERECHO</span>
                        </div>
                        <div className={`circulo-picker${selectedArmR ? ' selected' : ''}`}
                          onClick={handleArmRPickerClick} style={{background: colors.Arm_R}}/>
                        <input type="color" style={{display:'none'}} ref={armRPickerRef} onChange={handleArmRColorChange} value={colors.Arm_R}/>
                      </div>
                      <div className="fila-parte">
                        <div style={{display:'flex',alignItems:'center'}}>
                          <div className="icono-parte"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 17l4-6 4 5 4-7 4 8" stroke="#7FB3FF" strokeWidth="2" fill="none"/></svg></div>
                          <span className="texto-parte">BRAZO IZQUIERDO</span>
                        </div>
                        <div className={`circulo-picker${selectedArmL ? ' selected' : ''}`}
                          onClick={handleArmLPickerClick} style={{background: colors.Arm_L}}/>
                        <input type="color" style={{display:'none'}} ref={armLPickerRef} onChange={handleArmLColorChange} value={colors.Arm_L}/>
                      </div>
                      <div className="fila-parte">
                        <div style={{display:'flex',alignItems:'center'}}>
                          <div className="icono-parte"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 17l4-6 4 5 4-7 4 8" stroke="#7FB3FF" strokeWidth="2" fill="none"/></svg></div>
                          <span className="texto-parte">PIERNA DERECHA</span>
                        </div>
                        <div className={`circulo-picker${selectedLegR ? ' selected' : ''}`}
                          onClick={handleLegRPickerClick} style={{background: colors.Leg_R}}/>
                        <input type="color" style={{display:'none'}} ref={legRPickerRef} onChange={handleLegRColorChange} value={colors.Leg_R}/>
                      </div>
                      <div className="fila-parte">
                        <div style={{display:'flex',alignItems:'center'}}>
                          <div className="icono-parte"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M4 17l4-6 4 5 4-7 4 8" stroke="#7FB3FF" strokeWidth="2" fill="none"/></svg></div>
                          <span className="texto-parte">PIERNA IZQUIERDA</span>
                        </div>
                        <div className={`circulo-picker${selectedLegL ? ' selected' : ''}`}
                          onClick={handleLegLPickerClick} style={{background: colors.Leg_L}}/>
                        <input type="color" style={{display:'none'}} ref={legLPickerRef} onChange={handleLegLColorChange} value={colors.Leg_L}/>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* NUEVO PASO 11: PRE-DESCARGA */}
      {step === 11 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#f7f7fa',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Montserrat, Arial, sans-serif',
        }}>
          <div style={{
            width: 900,
            maxWidth: '98vw',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
            padding: 32,
            display: 'flex',
            gap: 32,
            flexDirection: 'row',
            margin: '0 auto',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Vista previa de la plantilla PDF (siempre visible) */}
            <div style={{
              flex: 1.2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: 420,
                height: 260,
                background: '#eee',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                {pdfPreviewError && (
                  <div style={{ color: '#c00', fontWeight: 700, textAlign: 'center' }}>{pdfPreviewError}</div>
                )}
                {!pdfPreviewUrl && !pdfPreviewError && (
                  <div style={{ color: '#888', fontWeight: 700, fontSize: 16 }}>Cargando vista previa del PDF…</div>
                )}
                {pdfPreviewUrl && (
                  <iframe
                    src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Vista previa del PDF"
                    width="100%"
                    height="100%"
                    className="pdf-preview-iframe"
                    frameBorder="0"
                    style={{ border: 'none', width: '100%', height: '100%' }}
                  />
                )}
              </div>
              <div style={{ fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4 }}>
                Vista previa de tu plantilla personalizada (PDF real con marca de agua).<br />
                La descarga será instantánea cuando el PDF esté listo y el código sea válido.
              </div>
            </div>
            {/* Panel derecho: código y ayuda */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minWidth: 260,
            }}>
              <div>
                <h2 style={{ fontWeight: 900, fontSize: 24, marginBottom: 12 }}>Descarga tu plantilla</h2>
                <div style={{ fontSize: 16, color: '#444', marginBottom: 18 }}>
                  Ingresa el <b>código de descarga</b> que recibiste tras tu compra para obtener tu plantilla sin marca de agua.
                </div>
                <input
                  type="text"
                  placeholder="Código de descarga"
                  value={downloadCode}
                  onChange={e => { setDownloadCode(e.target.value); setIsCodeValid(false); setCodeError(''); }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 18,
                    borderRadius: 8,
                    border: '1.5px solid #bbb',
                    marginBottom: 8,
                    outline: isCodeValid ? '2px solid #00c37a' : codeError ? '2px solid #e74c3c' : 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') validateCode(); }}
                  autoFocus
                />
                <button
                  onClick={validateCode}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: '#5B2EFF',
                    color: '#fff',
                    fontWeight: 900,
                    fontSize: 18,
                    marginBottom: 8,
                    cursor: 'pointer',
                    opacity: downloadCode.length > 0 ? 1 : 0.6,
                    transition: 'opacity 0.2s',
                  }}
                  disabled={downloadCode.length === 0}
                >
                  Validar código
                </button>
                {codeError && <div style={{ color: '#e74c3c', fontWeight: 700, marginBottom: 8 }}>{codeError}</div>}
                <button
                  className="download-button"
                  disabled={!pdfBlobUrl || !isCodeValid}
                  onClick={() => {
                    if (!pdfBlobUrl) return;
                    const link = document.createElement('a');
                    link.href = pdfBlobUrl;
                    link.download = 'plantilla-papelcool.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Descargar plantilla
                </button>
                <button
                  onClick={() => setStep(10)}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: 8,
                    border: '1.5px solid #5B2EFF',
                    background: '#fff',
                    color: '#5B2EFF',
                    fontWeight: 900,
                    fontSize: 16,
                    marginBottom: 18,
                    cursor: 'pointer',
                  }}
                >
                  Volver a personalizar
                </button>
                <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>
                  ¿No tienes código? <a href="mailto:soporte@papelcool.com" style={{ color: '#5B2EFF', textDecoration: 'underline' }}>Contáctanos</a><br />
                  ¿Problemas con tu código? <a href="mailto:soporte@papelcool.com" style={{ color: '#5B2EFF', textDecoration: 'underline' }}>Soporte</a>
                </div>
              </div>
              {/* Resumen de compra */}
              <div style={{
                background: '#f3f3fa',
                borderRadius: 12,
                padding: 16,
                marginTop: 18,
                fontSize: 15,
                color: '#444',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 4 }}>Resumen de tu compra</div>
                <div>Plantilla personalizada Papelcool</div>
                <div style={{ color: '#888', fontSize: 13 }}>Incluye todos los accesorios y fondo seleccionado</div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>S/ 24.99</div>
                <div style={{ color: '#888', fontSize: 12, marginTop: 6 }}>La descarga es válida solo una vez por código.</div>
              </div>
              {/* Enlace a YouTube y redes sociales */}
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" style={{ color: '#e74c3c', fontWeight: 700, fontSize: 16, textDecoration: 'underline' }}>
                  ¿No sabes cómo armar tu Papelcool? Mira el tutorial en YouTube
                </a>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 18 }}>
                  <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: '#4267B2', fontSize: 28 }}>
                    <i className="fab fa-facebook-square"></i> Facebook
                  </a>
                  <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: '#C13584', fontSize: 28 }}>
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                  <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: '#e74c3c', fontSize: 28 }}>
                    <i className="fab fa-youtube"></i> YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Componente HoverButton para animación individual
function HoverButton({ style, onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      style={{
        ...style,
        background: hover ? '#e0e0ff' : style.background,
        transform: hover ? 'scale(1.08)' : 'scale(1)',
      }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

