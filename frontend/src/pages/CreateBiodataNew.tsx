import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import {
  commonFields,
  familyFields,
  contactFields,
  preferencesFields,
  getReligionFields
} from '../data/religionFields';
import { templates, getTemplateById, getOriginalPrice } from '../data/templates';
import { godIcons, getIconSvg, normalizeIconId } from '../data/godIcons';
import html2canvas from 'html2canvas';
import '../components/TemplateCard.css';
import './CreateBiodataNew.css';

interface BiodataForm {
  [key: string]: string;
}

const STORAGE_KEY = 'shaadi_biodata_draft';

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveDraft = (data: Record<string, any>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const CreateBiodataNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation state takes priority (coming back from preview), then localStorage draft
  const savedState = location.state || {};
  const draft = Object.keys(savedState).length > 0 ? {} : loadDraft();

  const [religion, setReligion] = useState<string>(savedState.religion || draft.religion || '');
  const [showGaneshaIcon, setShowGaneshaIcon] = useState<boolean>(savedState.showGaneshaIcon ?? draft.showGaneshaIcon ?? true);
  const [showShreeGanesh, setShowShreeGanesh] = useState<boolean>(savedState.showShreeGanesh ?? draft.showShreeGanesh ?? true);
  const [showBiodata, setShowBiodata] = useState<boolean>(savedState.showBiodata ?? draft.showBiodata ?? true);
  const [shreeGaneshText, setShreeGaneshText] = useState<string>(savedState.shreeGaneshText || draft.shreeGaneshText || '|| Shree Ganesh ||');
  const [biodataText, setBiodataText] = useState<string>(savedState.biodataText || draft.biodataText || 'BIO DATA');
  const [editingShreeGanesh, setEditingShreeGanesh] = useState<boolean>(false);
  const [editingBiodata, setEditingBiodata] = useState<boolean>(false);
  const [selectedGodIcon, setSelectedGodIcon] = useState<string>(normalizeIconId(savedState.selectedGodIcon || draft.selectedGodIcon));
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [formData, setFormData] = useState<BiodataForm>(savedState.formData || draft.formData || {});
  const [photo, setPhoto] = useState<File | null>(savedState.photo || null);
  const [photoShape, setPhotoShape] = useState<'rectangle' | 'circle'>(savedState.photoShape || draft.photoShape || 'rectangle');
  const [selectedTemplate, setSelectedTemplate] = useState<string>(savedState.templateId || draft.selectedTemplate || 'elegant-red');
  const [selectedSymbol, setSelectedSymbol] = useState<string>(savedState.selectedSymbol || draft.selectedSymbol || '');
  const [customColor, setCustomColor] = useState<string>(savedState.customColor || draft.customColor || '');
  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  const [isPreviewSticky, setIsPreviewSticky] = useState<boolean>(true);
  const [previewTopPosition, setPreviewTopPosition] = useState<number>(0);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(savedState.customLabels || draft.customLabels || {});
  const [editingLabelField, setEditingLabelField] = useState<string | null>(null);

  // Photo cropper states
  const [showCropper, setShowCropper] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);
  const formatsRef = useRef<HTMLDivElement>(null);
  const photoSectionRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const religions = ['hindu', 'muslim', 'christian', 'sikh'];

  // Religious symbols mapping
  const religiousSymbols: any = {
    hindu: ['🕉️', '🪔', '🌺', '🙏'],
    muslim: ['☪️', '🕌', '📿', '☪'],
    christian: ['✝️', '⛪', '🙏', '✨'],
    sikh: ['☬', '🗡️', '🙏', '✨']
  };

  // Auto-save draft to localStorage on every state change
  useEffect(() => {
    saveDraft({
      religion, showGaneshaIcon, showShreeGanesh, showBiodata,
      shreeGaneshText, biodataText, selectedGodIcon,
      formData, photoShape, selectedTemplate, selectedSymbol,
      customColor, customLabels,
    });
  }, [religion, showGaneshaIcon, showShreeGanesh, showBiodata,
      shreeGaneshText, biodataText, selectedGodIcon,
      formData, photoShape, selectedTemplate, selectedSymbol,
      customColor, customLabels]);

  // Disabled complex scroll logic - using pure CSS sticky instead
  useEffect(() => {
    // No scroll listener needed
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        }
      }, 'image/jpeg');
    });
  };

  const handleCropSave = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImageUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
        setCroppedImage(croppedImageUrl);

        // Convert to File object
        const response = await fetch(croppedImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cropped-photo.jpg', { type: 'image/jpeg' });
        setPhoto(file);

        setShowCropper(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleReligionChange = (rel: string) => {
    setReligion(rel);
    // Set default symbol for the religion
    setSelectedSymbol(religiousSymbols[rel]?.[0] || '');
    // Pre-fill religion field in formData
    setFormData(prev => ({ ...prev, religion: getReligionFields(rel).name }));
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      setReligion('');
      setFormData({});
      setPhoto(null);
      setSelectedTemplate('elegant-red');
      setSelectedSymbol('');
      setShowGaneshaIcon(true);
      setShowShreeGanesh(true);
      setShowBiodata(true);
      setShreeGaneshText('|| Shree Ganesh ||');
      setBiodataText('BIO DATA');
      setSelectedGodIcon('🐘');
      setShowIconPicker(false);
    }
  };

  // Download preview as image - available for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadPreview = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `biodata-preview-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading preview:', error);
      alert('Failed to download preview. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName?.trim()) {
      alert('Please enter Full Name');
      return;
    }

    if (!formData.dateOfBirth) {
      alert('Please enter Date of Birth');
      return;
    }

    if (!formData.phone?.trim()) {
      alert('Please enter Phone Number');
      return;
    }

    if (formData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      alert('Please enter a valid Email Address');
      return;
    }

    if (!selectedTemplate) {
      alert('Please select a template');
      return;
    }

    // Navigate to download page
    navigate('/download', {
      state: {
        formData,
        religion,
        photo,
        templateId: selectedTemplate,
        customColor,
        selectedSymbol,
        showGaneshaIcon,
        showShreeGanesh,
        showBiodata,
        shreeGaneshText,
        biodataText,
        selectedGodIcon,
        photoShape
      }
    });
  };

  const renderField = (field: any) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleInputChange,
      required: field.required,
      placeholder: field.placeholder || ''
    };

    if (field.type === 'select') {
      return (
        <select {...commonProps} className="form-input">
          <option value="">Select {field.label}</option>
          {field.options?.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          className="form-input"
          rows={3}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={field.type}
        className="form-input"
      />
    );
  };

  const religionFields = religion ? getReligionFields(religion).fields : [];
  const template = getTemplateById(selectedTemplate);

  // Get the effective color (custom color overrides template color)
  const effectiveColor = customColor || template?.colors.primary || '#DC2626';

  // Color palette options for the header-color customization popup
  const colorOptions = [
    { name: 'Red', value: '#DC2626' },
    { name: 'Maroon', value: '#991B1B' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Emerald', value: '#047857' },
    { name: 'Blue', value: '#1E40AF' },
    { name: 'Purple', value: '#7C3AED' },
    { name: 'Pink', value: '#DB2777' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Gold', value: '#D97706' },
    { name: 'Teal', value: '#0D9488' },
    { name: 'Brown', value: '#78350F' }
  ];

  // Generate SVG border with custom color for preview only
  const generateBorderSVG = (color: string, templateId: string, mini = false) => {
    const encodedColor = color; // use raw color directly inside SVG, then base64 the whole thing

    // Mini preview patterns — thin strokes hugging the viewBox edge so they don't overlap text
    const miniPatterns: { [key: string]: string } = {
      'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' stroke-width='0.4'/></g></svg>`,
      'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='6' y='6' width='388' height='588' stroke-width='1'/></g></svg>`,
      'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='0.8' d='M30,6 L370,6 M394,30 L394,570 M370,594 L30,594 M6,570 L6,30'/><path stroke-width='0.8' d='M30,6 L18,6 L18,18 L6,18 L6,30'/><path stroke-width='0.8' d='M370,6 L382,6 L382,18 L394,18 L394,30'/><path stroke-width='0.8' d='M394,570 L394,582 L382,582 L382,594 L370,594'/><path stroke-width='0.8' d='M6,570 L6,582 L18,582 L18,594 L30,594'/></g></svg>`,
      'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1' stroke-linecap='square'><path d='M6,80 L6,6 L80,6'/><path d='M320,6 L394,6 L394,80'/><path d='M394,520 L394,594 L320,594'/><path d='M80,594 L6,594 L6,520'/><path d='M150,6 L250,6'/><path d='M150,594 L250,594'/><path d='M6,220 L6,380'/><path d='M394,220 L394,380'/></g></svg>`,
      'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8' stroke-dasharray='8 4'/></g></svg>`,
      'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' rx='20' stroke-width='0.8'/><rect x='12' y='12' width='376' height='576' rx='14' stroke-width='0.4'/></g></svg>`,
      'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='0.8' d='M8,8 L185,8 L200,24 L215,8 L392,8 L392,285 L376,300 L392,315 L392,592 L215,592 L200,576 L185,592 L8,592 L8,315 L24,300 L8,285 Z'/></g></svg>`,
      'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='1' d='M8,160 L8,8 L160,8'/><path stroke-width='1' d='M240,8 L392,8 L392,160'/><path stroke-width='1' d='M392,440 L392,592 L240,592'/><path stroke-width='1' d='M160,592 L8,592 L8,440'/><path stroke-width='0.4' d='M16,150 L16,16 L150,16'/><path stroke-width='0.4' d='M250,16 L384,16 L384,150'/><path stroke-width='0.4' d='M384,450 L384,584 L250,584'/><path stroke-width='0.4' d='M150,584 L16,584 L16,450'/></g></svg>`,
      'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8'><path d='M6,6 L6,594'/><path d='M394,6 L394,594'/><path d='M6,6 Q16,16 26,6 Q36,16 46,6 Q56,16 66,6 Q76,16 86,6 Q96,16 106,6 Q116,16 126,6 Q136,16 146,6 Q156,16 166,6 Q176,16 186,6 Q196,16 206,6 Q216,16 226,6 Q236,16 246,6 Q256,16 266,6 Q276,16 286,6 Q296,16 306,6 Q316,16 326,6 Q336,16 346,6 Q356,16 366,6 Q376,16 386,6 Q392,12 394,6'/><path d='M6,594 Q16,584 26,594 Q36,584 46,594 Q56,584 66,594 Q76,584 86,594 Q96,584 106,594 Q116,584 126,594 Q136,584 146,594 Q156,584 166,594 Q176,584 186,594 Q196,584 206,594 Q216,584 226,594 Q236,584 246,594 Q256,584 266,594 Q276,584 286,594 Q296,584 306,594 Q316,584 326,594 Q336,584 346,594 Q356,584 366,594 Q376,584 386,594 Q392,588 394,594'/></g></svg>`,
      'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='6' y='6' width='388' height='588' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' rx='22' stroke-width='0.4'/></g></svg>`,
      'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.4'><rect x='4' y='4' width='392' height='592'/><rect x='7' y='7' width='386' height='586'/><rect x='10' y='10' width='380' height='580'/></g></svg>`,
      'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.8' stroke-linecap='round' stroke-linejoin='round'><path d='M28,10 Q28,4 18,4 Q8,4 8,14 Q8,22 18,22 Q22,22 22,18 Q22,14 18,14'/><path d='M28,10 Q45,6 60,10 Q75,14 90,10 Q100,7 110,10'/><path stroke-width='0.6' d='M110,10 Q116,4 122,8 Q122,13 118,12'/><path d='M122,10 Q138,10 152,10'/><path d='M10,28 Q6,45 10,60 Q14,75 10,90 Q7,100 10,110'/><path stroke-width='0.6' d='M10,110 Q4,116 8,122 Q13,122 12,118'/><path d='M10,122 Q10,138 10,152'/><path d='M372,10 Q372,4 382,4 Q392,4 392,14 Q392,22 382,22 Q378,22 378,18 Q378,14 382,14'/><path d='M372,10 Q355,6 340,10 Q325,14 310,10 Q300,7 290,10'/><path stroke-width='0.6' d='M290,10 Q284,4 278,8 Q278,13 282,12'/><path d='M278,10 Q262,10 248,10'/><path d='M390,28 Q394,45 390,60 Q386,75 390,90 Q393,100 390,110'/><path stroke-width='0.6' d='M390,110 Q396,116 392,122 Q387,122 388,118'/><path d='M390,122 Q390,138 390,152'/><path d='M28,590 Q28,596 18,596 Q8,596 8,586 Q8,578 18,578 Q22,578 22,582 Q22,586 18,586'/><path d='M28,590 Q45,594 60,590 Q75,586 90,590 Q100,593 110,590'/><path stroke-width='0.6' d='M110,590 Q116,596 122,592 Q122,587 118,588'/><path d='M122,590 Q138,590 152,590'/><path d='M10,572 Q6,555 10,540 Q14,525 10,510 Q7,500 10,490'/><path stroke-width='0.6' d='M10,490 Q4,484 8,478 Q13,478 12,482'/><path d='M10,478 Q10,462 10,448'/><path d='M372,590 Q372,596 382,596 Q392,596 392,586 Q392,578 382,578 Q378,578 378,582 Q378,586 382,586'/><path d='M372,590 Q355,594 340,590 Q325,586 310,590 Q300,593 290,590'/><path stroke-width='0.6' d='M290,590 Q284,596 278,592 Q278,587 282,588'/><path d='M278,590 Q262,590 248,590'/><path d='M390,572 Q394,555 390,540 Q386,525 390,510 Q393,500 390,490'/><path stroke-width='0.6' d='M390,490 Q396,484 392,478 Q387,478 388,482'/><path d='M390,478 Q390,462 390,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='10' r='1.5'/><circle cx='200' cy='10' r='2'/><circle cx='220' cy='10' r='1.5'/><circle cx='180' cy='590' r='1.5'/><circle cx='200' cy='590' r='2'/><circle cx='220' cy='590' r='1.5'/><circle cx='10' cy='280' r='1.5'/><circle cx='10' cy='300' r='2'/><circle cx='10' cy='320' r='1.5'/><circle cx='390' cy='280' r='1.5'/><circle cx='390' cy='300' r='2'/><circle cx='390' cy='320' r='1.5'/></g></svg>`,
      'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='4' y='4' width='392' height='592' stroke-width='0.6' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g></svg>`,
      'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='0.8'/><rect x='14' y='14' width='372' height='572' stroke-width='0.4'/></g><g fill='${encodedColor}'><rect x='4' y='4' width='8' height='8'/><rect x='388' y='4' width='8' height='8'/><rect x='4' y='588' width='8' height='8'/><rect x='388' y='588' width='8' height='8'/></g></svg>`,
      'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.7'><line x1='42' y1='7' x2='358' y2='7'/><line x1='42' y1='593' x2='358' y2='593'/><line x1='7' y1='62' x2='7' y2='538'/><line x1='393' y1='62' x2='393' y2='538'/></g><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.3'><line x1='42' y1='11' x2='358' y2='11'/><line x1='42' y1='589' x2='358' y2='589'/><line x1='11' y1='62' x2='11' y2='538'/><line x1='389' y1='62' x2='389' y2='538'/></g><g fill='${encodedColor}'><polygon points='7,7 30,7 7,30'/><polygon points='393,7 370,7 393,30'/><polygon points='7,593 30,593 7,570'/><polygon points='393,593 370,593 393,570'/><polygon points='7,7 30,7 18,18'/><polygon points='393,7 370,7 382,18'/><polygon points='7,593 30,593 18,582'/><polygon points='393,593 370,593 382,582'/><rect x='4' y='4' width='6' height='6'/><rect x='390' y='4' width='6' height='6'/><rect x='4' y='590' width='6' height='6'/><rect x='390' y='590' width='6' height='6'/><polygon points='200,5 203,11 200,17 197,11'/><polygon points='200,583 203,589 200,595 197,589'/><polygon points='5,298 11,295 17,298 11,301'/><polygon points='383,298 389,295 395,298 389,301'/><circle cx='110' cy='7' r='1.5'/><circle cx='290' cy='7' r='1.5'/><circle cx='110' cy='593' r='1.5'/><circle cx='290' cy='593' r='1.5'/><circle cx='7' cy='180' r='1.5'/><circle cx='7' cy='420' r='1.5'/><circle cx='393' cy='180' r='1.5'/><circle cx='393' cy='420' r='1.5'/></g></svg>`,
      'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='8' y='8' width='384' height='584' stroke-width='1' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M8,2 L14,8 L8,14 L2,8 Z'/><path d='M392,2 L398,8 L392,14 L386,8 Z'/><path d='M8,586 L14,592 L8,598 L2,592 Z'/><path d='M392,586 L398,592 L392,598 L386,592 Z'/></g></svg>`,
    };

    // Gallery patterns — original thick strokes for the template selection section
    const galleryPatterns: { [key: string]: string } = {
      'elegant-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='12' y='12' width='376' height='576' stroke-width='1.5'/><rect x='20' y='20' width='360' height='560' stroke-width='0.6'/></g></svg>`,
      'modern-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='14' y='14' width='372' height='572' stroke-width='2.5'/></g></svg>`,
      'golden-yellow': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-linecap='square'><path stroke-width='1.5' d='M30,12 L370,12 M388,30 L388,570 M370,588 L30,588 M12,570 L12,30'/><path stroke-width='1.5' d='M30,12 L20,12 L20,22 L12,22 L12,30'/><path stroke-width='1.5' d='M370,12 L380,12 L380,22 L388,22 L388,30'/><path stroke-width='1.5' d='M388,570 L388,578 L380,578 L380,588 L370,588'/><path stroke-width='1.5' d='M12,570 L12,578 L20,578 L20,588 L30,588'/></g></svg>`,
      'festive-trio': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='2' stroke-linecap='square'><path d='M12,80 L12,12 L80,12'/><path d='M320,12 L388,12 L388,80'/><path d='M388,520 L388,588 L320,588'/><path d='M80,588 L12,588 L12,520'/><path d='M150,12 L250,12'/><path d='M150,588 L250,588'/><path d='M12,220 L12,380'/><path d='M388,220 L388,380'/></g></svg>`,
      'royal-red': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5' stroke-dasharray='8 4'/></g></svg>`,
      'nature-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' rx='20' stroke-width='1.5'/><rect x='22' y='22' width='356' height='556' rx='14' stroke-width='0.6'/></g></svg>`,
      'luxury-gold': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><path stroke-width='1.5' d='M14,14 L185,14 L200,32 L215,14 L386,14 L386,285 L368,300 L386,315 L386,586 L215,586 L200,568 L185,586 L14,586 L14,315 L32,300 L14,285 Z'/></g></svg>`,
      'maroon-elegance': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linecap='square'><path stroke-width='2.5' d='M14,160 L14,14 L160,14'/><path stroke-width='2.5' d='M240,14 L386,14 L386,160'/><path stroke-width='2.5' d='M386,440 L386,586 L240,586'/><path stroke-width='2.5' d='M160,586 L14,586 L14,440'/><path stroke-width='0.8' d='M22,150 L22,22 L150,22'/><path stroke-width='0.8' d='M250,22 L378,22 L378,150'/><path stroke-width='0.8' d='M378,450 L378,578 L250,578'/><path stroke-width='0.8' d='M150,578 L22,578 L22,450'/></g></svg>`,
      'pink-blossom': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5'><path d='M14,14 L14,586'/><path d='M386,14 L386,586'/><path d='M14,14 Q24,24 34,14 Q44,24 54,14 Q64,24 74,14 Q84,24 94,14 Q104,24 114,14 Q124,24 134,14 Q144,24 154,14 Q164,24 174,14 Q184,24 194,14 Q204,24 214,14 Q224,24 234,14 Q244,24 254,14 Q264,24 274,14 Q284,24 294,14 Q304,24 314,14 Q324,24 334,14 Q344,24 354,14 Q364,24 374,14 Q384,24 386,14'/><path d='M14,586 Q24,576 34,586 Q44,576 54,586 Q64,576 74,586 Q84,576 94,586 Q104,576 114,586 Q124,576 134,586 Q144,576 154,586 Q164,576 174,586 Q184,576 194,586 Q204,576 214,586 Q224,576 234,586 Q244,576 254,586 Q264,576 274,586 Q284,576 294,586 Q304,576 314,586 Q324,576 334,586 Q344,576 354,586 Q364,576 374,586 Q384,576 386,586'/></g></svg>`,
      'emerald-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='14' y='14' width='372' height='572' stroke-width='1.5'/><rect x='26' y='26' width='348' height='548' rx='22' stroke-width='0.8'/></g></svg>`,
      'royal-blue': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='0.5'><rect x='4' y='4' width='392' height='592'/><rect x='7' y='7' width='386' height='586'/><rect x='10' y='10' width='380' height='580'/></g></svg>`,
      'amber-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M28,18 Q28,8 18,8 Q8,8 8,18 Q8,28 18,28 Q24,28 24,22 Q24,17 19,17'/><path d='M28,18 Q45,12 60,18 Q75,24 90,18 Q100,14 110,18'/><path stroke-width='1.2' d='M110,18 Q116,10 124,15 Q124,21 118,20'/><path d='M124,18 Q138,18 152,18'/><path d='M18,28 Q12,45 18,60 Q24,75 18,90 Q14,100 18,110'/><path stroke-width='1.2' d='M18,110 Q10,116 15,124 Q21,124 20,118'/><path d='M18,124 Q18,138 18,152'/><path d='M372,18 Q372,8 382,8 Q392,8 392,18 Q392,28 382,28 Q376,28 376,22 Q376,17 381,17'/><path d='M372,18 Q355,12 340,18 Q325,24 310,18 Q300,14 290,18'/><path stroke-width='1.2' d='M290,18 Q284,10 276,15 Q276,21 282,20'/><path d='M276,18 Q262,18 248,18'/><path d='M382,28 Q388,45 382,60 Q376,75 382,90 Q386,100 382,110'/><path stroke-width='1.2' d='M382,110 Q390,116 385,124 Q379,124 380,118'/><path d='M382,124 Q382,138 382,152'/><path d='M28,582 Q28,592 18,592 Q8,592 8,582 Q8,572 18,572 Q24,572 24,578 Q24,583 19,583'/><path d='M28,582 Q45,588 60,582 Q75,576 90,582 Q100,586 110,582'/><path stroke-width='1.2' d='M110,582 Q116,590 124,585 Q124,579 118,580'/><path d='M124,582 Q138,582 152,582'/><path d='M18,572 Q12,555 18,540 Q24,525 18,510 Q14,500 18,490'/><path stroke-width='1.2' d='M18,490 Q10,484 15,476 Q21,476 20,482'/><path d='M18,476 Q18,462 18,448'/><path d='M372,582 Q372,592 382,592 Q392,592 392,582 Q392,572 382,572 Q376,572 376,578 Q376,583 381,583'/><path d='M372,582 Q355,588 340,582 Q325,576 310,582 Q300,586 290,582'/><path stroke-width='1.2' d='M290,582 Q284,590 276,585 Q276,579 282,580'/><path d='M276,582 Q262,582 248,582'/><path d='M382,572 Q388,555 382,540 Q376,525 382,510 Q386,500 382,490'/><path stroke-width='1.2' d='M382,490 Q390,116 385,476 Q379,476 380,482'/><path d='M382,476 Q382,462 382,448'/></g><g fill='${encodedColor}'><circle cx='180' cy='18' r='3'/><circle cx='200' cy='18' r='4'/><circle cx='220' cy='18' r='3'/><circle cx='180' cy='582' r='3'/><circle cx='200' cy='582' r='4'/><circle cx='220' cy='582' r='3'/><circle cx='18' cy='260' r='2.5'/><circle cx='18' cy='300' r='3'/><circle cx='18' cy='340' r='2.5'/><circle cx='382' cy='260' r='2.5'/><circle cx='382' cy='300' r='3'/><circle cx='382' cy='340' r='2.5'/></g></svg>`,
      'royal-mandala': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}'><rect x='8' y='8' width='384' height='584' stroke-width='1.2' stroke-dasharray='0.5 4' stroke-linecap='round'/><rect x='16' y='16' width='368' height='568' stroke-width='2.2' stroke-dasharray='0.5 9' stroke-linecap='round'/><rect x='24' y='24' width='352' height='552' stroke-width='0.6'/></g></svg>`,
      'sapphire-classic': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='15' y='15' width='370' height='570' stroke-width='2'/><rect x='26' y='26' width='348' height='548' stroke-width='0.8'/></g><g fill='${encodedColor}'><rect x='5' y='5' width='18' height='18'/><rect x='377' y='5' width='18' height='18'/><rect x='5' y='577' width='18' height='18'/><rect x='377' y='577' width='18' height='18'/></g></svg>`,
      'crimson-rose': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='1.2'><line x1='48' y1='10' x2='352' y2='10'/><line x1='48' y1='590' x2='352' y2='590'/><line x1='10' y1='72' x2='10' y2='528'/><line x1='390' y1='72' x2='390' y2='528'/></g><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter' stroke-width='0.5'><line x1='48' y1='14' x2='352' y2='14'/><line x1='48' y1='586' x2='352' y2='586'/><line x1='14' y1='72' x2='14' y2='528'/><line x1='386' y1='72' x2='386' y2='528'/></g><g fill='${encodedColor}'><polygon points='10,10 38,10 10,38'/><polygon points='390,10 362,10 390,38'/><polygon points='10,590 38,590 10,562'/><polygon points='390,590 362,590 390,562'/><polygon points='10,10 38,10 24,24'/><polygon points='390,10 362,10 376,24'/><polygon points='10,590 38,590 24,576'/><polygon points='390,590 362,590 376,576'/><rect x='6' y='6' width='8' height='8'/><rect x='386' y='6' width='8' height='8'/><rect x='6' y='586' width='8' height='8'/><rect x='386' y='586' width='8' height='8'/><polygon points='200,6 204,14 200,22 196,14'/><polygon points='200,578 204,586 200,594 196,586'/><polygon points='6,297 14,293 22,297 14,301'/><polygon points='378,297 386,293 394,297 386,301'/><line x1='196' y1='10' x2='204' y2='10' stroke='${encodedColor}' stroke-width='1.5'/><line x1='196' y1='590' x2='204' y2='590' stroke='${encodedColor}' stroke-width='1.5'/><line x1='10' y1='296' x2='10' y2='304' stroke='${encodedColor}' stroke-width='1.5'/><line x1='390' y1='296' x2='390' y2='304' stroke='${encodedColor}' stroke-width='1.5'/><circle cx='110' cy='10' r='2.5'/><circle cx='290' cy='10' r='2.5'/><circle cx='110' cy='590' r='2.5'/><circle cx='290' cy='590' r='2.5'/><circle cx='10' cy='180' r='2.5'/><circle cx='10' cy='420' r='2.5'/><circle cx='390' cy='180' r='2.5'/><circle cx='390' cy='420' r='2.5'/></g></svg>`,
      'peacock-green': `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g fill='none' stroke='${encodedColor}' stroke-linejoin='miter'><rect x='16' y='16' width='368' height='568' stroke-width='2.5' stroke-dasharray='16 7'/></g><g fill='${encodedColor}'><path d='M16,5 L27,16 L16,27 L5,16 Z'/><path d='M384,5 L395,16 L384,27 L373,16 Z'/><path d='M16,573 L27,584 L16,595 L5,584 Z'/><path d='M384,573 L395,584 L384,595 L373,584 Z'/></g></svg>`,
    };

    const svgPatterns = mini ? miniPatterns : galleryPatterns;

    // Default pattern
    const defaultPattern = mini
      ? `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='1' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`
      : `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600' preserveAspectRatio='none'><g stroke='${encodedColor}' stroke-width='2.5' fill='none'><path d='M5,5 L60,5 M5,5 L5,60 M395,5 L340,5 M395,5 L395,60 M5,595 L60,595 M5,595 L5,540 M395,595 L340,595 M395,595 L395,540 M80,5 L320,5 M80,595 L320,595 M5,100 L5,500 M395,100 L395,500'/></g></svg>`;

    // Use hasOwnProperty to check if template exists, to handle empty string patterns
    const svgPattern = templateId in svgPatterns ? svgPatterns[templateId] : defaultPattern;
    if (!svgPattern) {
      return 'none';
    }
    return `url("data:image/svg+xml;base64,${btoa(svgPattern)}")`;
  };

  return (
    <div className="create-biodata-new-page">
      <div className="create-container">

        {/* Left Side - Form */}
        <div className="form-section">
          <div className="form-header">
            <h1 className="form-title">Create Your Biodata</h1>
            <p className="form-subtitle">Fill in your details and see live preview on the right</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Header Customization */}
            <div className="form-section-card">
              <div className="section-header-with-action">
                <h2 className="section-heading">
                  <span className="section-icon">✨</span>
                  Customize Header
                </h2>
                <button type="button" className="btn-clear" onClick={handleClearForm}>
                  🗑️ Clear Form
                </button>
              </div>
              <div className="header-toggles">
                <div className="toggle-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showGaneshaIcon}
                      onChange={(e) => setShowGaneshaIcon(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="toggle-content">
                    <button
                      type="button"
                      className="change-icon-btn-styled"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                    >
                      <span className="pencil-icon">✏️</span>
                      <span className="change-text">Change</span>
                    </button>
                    <span
                      className="toggle-icon-large"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  </div>
                  {showIconPicker && (
                    <div className="icon-picker-dropdown">
                      <button
                        type="button"
                        className="icon-picker-close"
                        onClick={() => setShowIconPicker(false)}
                        title="Close"
                        aria-label="Close icon picker"
                      >
                        ✕
                      </button>
                      <div className="icon-picker-grid">
                        {godIcons.map((icon) => (
                          <button
                            key={icon.id}
                            type="button"
                            className={`icon-option ${selectedGodIcon === icon.id ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedGodIcon(icon.id);
                              setShowIconPicker(false);
                            }}
                            title={icon.label}
                            dangerouslySetInnerHTML={{ __html: icon.svg }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="toggle-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showShreeGanesh}
                      onChange={(e) => setShowShreeGanesh(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="toggle-content">
                    <button
                      type="button"
                      className="edit-icon-btn"
                      onClick={() => setEditingShreeGanesh(!editingShreeGanesh)}
                    >
                      ✏️
                    </button>
                    {editingShreeGanesh ? (
                      <input
                        type="text"
                        className="toggle-text-input"
                        value={shreeGaneshText}
                        onChange={(e) => setShreeGaneshText(e.target.value)}
                        onBlur={() => setEditingShreeGanesh(false)}
                        placeholder="|| Shree Ganesh ||"
                        autoFocus
                      />
                    ) : (
                      <span className="toggle-text">{shreeGaneshText}</span>
                    )}
                  </div>
                </div>
                <div className="toggle-item">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={showBiodata}
                      onChange={(e) => setShowBiodata(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <div className="toggle-content">
                    <button
                      type="button"
                      className="edit-icon-btn"
                      onClick={() => setEditingBiodata(!editingBiodata)}
                    >
                      ✏️
                    </button>
                    {editingBiodata ? (
                      <input
                        type="text"
                        className="toggle-text-input-bold"
                        value={biodataText}
                        onChange={(e) => setBiodataText(e.target.value)}
                        onBlur={() => setEditingBiodata(false)}
                        placeholder="BIO DATA"
                        autoFocus
                      />
                    ) : (
                      <span className="toggle-text-bold">{biodataText}</span>
                    )}
                  </div>
                </div>
                <div className="header-color-row">
                  <span className="header-color-label">🎨 Choose Color</span>
                  <button
                    type="button"
                    className="color-customize-btn"
                    onClick={() => setShowColorModal(true)}
                    title="Choose color"
                  >
                    <span className="color-customize-swatch" style={{ backgroundColor: effectiveColor }}></span>
                    <span>Customize</span>
                  </button>
                  {customColor && (
                    <button
                      type="button"
                      className="color-reset-inline-btn"
                      onClick={() => setCustomColor('')}
                      title="Reset to template default color"
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">👤</span>
                Personal Details
              </h2>
              <div className="form-grid">
                {commonFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Religion-Specific Details */}
            {religion && religionFields.length > 0 && (
              <div className="form-section-card">
                <h2 className="section-heading">
                  <span className="section-icon">📿</span>
                  Religion Details
                </h2>
                <div className="form-grid">
                  {religionFields.map((field) => (
                    <div key={field.name} className="form-group">
                      <label className="form-label">
                        {field.label}
                        {field.required && <span className="required">*</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Family Details */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">👨‍👩‍👧‍👦</span>
                Family Information
              </h2>
              <div className="form-grid">
                {familyFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">📞</span>
                Contact Information
              </h2>
              <div className="form-grid">
                {contactFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Preferences */}
            <div className="form-section-card">
              <h2 className="section-heading">
                <span className="section-icon">💑</span>
                Partner Preferences
              </h2>
              <div className="form-grid">
                {preferencesFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="form-section-card" ref={photoSectionRef}>
              <h2 className="section-heading">
                <span className="section-icon">📷</span>
                Upload Photo
              </h2>
              <div className="photo-upload-compact">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                  className="photo-input"
                  id="photo-upload"
                />
                {photo ? (
                  <>
                    <div className="photo-shape-row">
                      <label className={`photo-shape-card ${photoShape === 'rectangle' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="photoShape"
                          checked={photoShape === 'rectangle'}
                          onChange={() => setPhotoShape('rectangle')}
                          className="photo-shape-radio"
                        />
                        <div className="photo-preview-shape rectangle">
                          <img src={croppedImage || URL.createObjectURL(photo)} alt="Rectangle preview" />
                        </div>
                        <span className="photo-shape-label-text">Rectangle</span>
                      </label>
                      <label className={`photo-shape-card ${photoShape === 'circle' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="photoShape"
                          checked={photoShape === 'circle'}
                          onChange={() => setPhotoShape('circle')}
                          className="photo-shape-radio"
                        />
                        <div className="photo-preview-shape circle">
                          <img src={croppedImage || URL.createObjectURL(photo)} alt="Circle preview" />
                        </div>
                        <span className="photo-shape-label-text">Circle</span>
                      </label>
                    </div>
                    <div className="photo-actions-row">
                      <label htmlFor="photo-upload" className="photo-change-button">
                        📷 Change Photo
                      </label>
                      <button
                        type="button"
                        className="photo-clear-button"
                        onClick={() => {
                          setPhoto(null);
                          setCroppedImage(null);
                        }}
                      >
                        🗑️ Clear Photo
                      </button>
                    </div>
                  </>
                ) : (
                  <label htmlFor="photo-upload" className="photo-upload-label">
                    <div className="photo-placeholder-small">
                      <span className="photo-icon">📷</span>
                      <span>Click to upload photo</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button ref={submitButtonRef} type="submit" className="btn btn-success btn-large btn-submit">
              <span className="btn-submit-text">Preview &amp; Download</span>
            </button>
          </form>
        </div>

        {/* Right Side - Live Preview */}
        <div className="preview-section" ref={previewSectionRef}>
          <div
            className={`preview-sticky ${!isPreviewSticky ? 'preview-scrollable' : ''}`}
            style={!isPreviewSticky ? { top: `${previewTopPosition}px` } : {}}
          >
            <h3 className="preview-title-main">Bio data PDF Preview</h3>

            {/* Symbol Picker (color picker moved to Customize Header section) */}
            {religion && religiousSymbols[religion] && (
              <div className="pickers-container">
                <div className="symbol-picker-section">
                  <label className="symbol-picker-label">
                    ✨ Select Symbol:
                  </label>
                  <div className="symbol-options-grid-2x2">
                    {religiousSymbols[religion].map((symbol: string, index: number) => (
                      <button
                        key={index}
                        type="button"
                        className={`symbol-option-btn ${selectedSymbol === symbol ? 'selected' : ''}`}
                        onClick={() => setSelectedSymbol(symbol)}
                        title={`Symbol ${index + 1}`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                  <div className="symbol-clear-btn-container">
                    {selectedSymbol ? (
                      <button
                        onClick={() => setSelectedSymbol('')}
                        className="symbol-clear-btn"
                        title="Clear symbol"
                      >
                        Clear
                      </button>
                    ) : (
                      <div className="symbol-clear-btn-placeholder"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="preview-scroll-wrapper">
            <div
              ref={previewRef}
              className={`mini-biodata-preview-mini mini-mehndi-border border-template-${template?.id || 'elegant-red'} ${!showShreeGanesh ? 'mini-hide-shree-ganesh' : ''} ${!showBiodata ? 'mini-hide-biodata' : ''} ${photo ? 'mini-has-photo' : ''}`}
              style={{
                position: 'relative',
                backgroundColor: template?.colors.background,
                ['--border-color' as any]: effectiveColor,
                ['--border-image' as any]: generateBorderSVG(effectiveColor, template?.id || 'elegant-red', true),
                ['--shree-ganesh-text' as any]: `"${shreeGaneshText}"`,
                ['--biodata-text' as any]: `"${biodataText}"`
              }}
            >
              <img
                className="mini-preview-border-img"
                src={generateBorderSVG(effectiveColor, template?.id || 'elegant-red', true).replace(/^url\("/, '').replace(/"\)$/, '')}
                alt=""
                aria-hidden="true"
              />
              <div className="mini-preview-inner-scroll">

              {/* God Icon at top center */}
              {showGaneshaIcon && selectedGodIcon && (
                <div
                  className="mini-ganesha-icon-header"
                  dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                />
              )}

              {/* Religious symbol as watermark - randomly placed at 4 locations */}
              {selectedSymbol && (
                <div className="mini-symbol-watermark" style={{ color: effectiveColor }}>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                  <span>{selectedSymbol}</span>
                </div>
              )}

              {/* Photo in top right corner */}
              {photo && (
                <div className={`mini-preview-photo-corner photo-shape-${photoShape}`} style={{ borderColor: effectiveColor }}>
                  <img src={croppedImage || URL.createObjectURL(photo)} alt="Profile" />
                </div>
              )}

              {/* Content Preview */}
              <div className="mini-preview-mini-content">

                {/* If Shree Ganesh toggle is ON - show text with icons on both sides */}
                {showShreeGanesh && (
                  <div className="mini-shree-ganesh-header">
                    {showGaneshaIcon && (
                      <span
                        className="mini-header-icon-left"
                        dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                      />
                    )}
                    <span className="mini-shree-ganesh-text">{shreeGaneshText}</span>
                    {showGaneshaIcon && (
                      <span
                        className="mini-header-icon-right"
                        dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                      />
                    )}
                  </div>
                )}

                {/* If Shree Ganesh toggle is OFF but icon toggle is ON - show icon alone at center */}
                {!showShreeGanesh && showGaneshaIcon && (
                  <div className="mini-icon-only-header">
                    <span
                      className="mini-icon-center"
                      dangerouslySetInnerHTML={{ __html: getIconSvg(selectedGodIcon) }}
                    />
                  </div>
                )}

                {/* BIO DATA text below Shree Ganesh */}
                {showBiodata && (
                  <div className="mini-biodata-header">
                    {biodataText}
                  </div>
                )}

                {/* Name at the top as title */}
                {formData.fullName && (
                  <h2 className="mini-preview-name-title">
                    {formData.fullName}
                  </h2>
                )}

                {/* Personal Details */}
                {(formData.dateOfBirth || formData.timeOfBirth || formData.placeOfBirth || formData.height || formData.weight || formData.complexion || formData.bloodGroup || formData.maritalStatus || formData.education || formData.college || formData.occupation || formData.company || formData.annualIncome || formData.workLocation) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Personal Details</div>
                )}
                {formData.dateOfBirth && <div className="mini-preview-field"><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>}
                {formData.timeOfBirth && <div className="mini-preview-field"><strong>Time of Birth:</strong> {formData.timeOfBirth}</div>}
                {formData.placeOfBirth && <div className="mini-preview-field"><strong>Place of Birth:</strong> {formData.placeOfBirth}</div>}
                {formData.height && <div className="mini-preview-field"><strong>Height:</strong> {formData.height}</div>}
                {formData.weight && <div className="mini-preview-field"><strong>Weight:</strong> {formData.weight}</div>}
                {formData.complexion && <div className="mini-preview-field"><strong>Complexion:</strong> {formData.complexion}</div>}
                {formData.bloodGroup && <div className="mini-preview-field"><strong>Blood Group:</strong> {formData.bloodGroup}</div>}
                {formData.maritalStatus && <div className="mini-preview-field"><strong>Marital Status:</strong> {formData.maritalStatus}</div>}

                {/* Education & Career */}
                {formData.education && <div className="mini-preview-field"><strong>Education:</strong> {formData.education}</div>}
                {formData.college && <div className="mini-preview-field"><strong>College/University:</strong> {formData.college}</div>}
                {formData.occupation && <div className="mini-preview-field"><strong>Occupation:</strong> {formData.occupation}</div>}
                {formData.company && <div className="mini-preview-field"><strong>Company:</strong> {formData.company}</div>}
                {formData.annualIncome && <div className="mini-preview-field"><strong>Annual Income:</strong> {formData.annualIncome}</div>}
                {formData.workLocation && <div className="mini-preview-field"><strong>Work Location:</strong> {formData.workLocation}</div>}

                {/* Religion Details */}
                {(formData.caste || formData.subCaste || formData.gotra || formData.rashi || formData.nakshatra || formData.manglik || formData.deity || formData.sect || formData.community || formData.maslak || formData.namazPractice || formData.hijab || formData.arabicName || formData.denomination || formData.churchAffiliation || formData.baptized || formData.sundayService || formData.jatha || formData.amritdhari || formData.keshdhari || formData.gurudwaraVisit) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Religion Details</div>
                )}
                {formData.caste && <div className="mini-preview-field"><strong>Caste:</strong> {formData.caste}</div>}
                {formData.subCaste && <div className="mini-preview-field"><strong>Sub-Caste:</strong> {formData.subCaste}</div>}
                {formData.gotra && <div className="mini-preview-field"><strong>Gotra:</strong> {formData.gotra}</div>}
                {formData.rashi && <div className="mini-preview-field"><strong>Rashi:</strong> {formData.rashi}</div>}
                {formData.nakshatra && <div className="mini-preview-field"><strong>Nakshatra:</strong> {formData.nakshatra}</div>}
                {formData.manglik && <div className="mini-preview-field"><strong>Manglik:</strong> {formData.manglik}</div>}
                {formData.deity && <div className="mini-preview-field"><strong>Kul Devta/Devi:</strong> {formData.deity}</div>}
                {formData.sect && <div className="mini-preview-field"><strong>Sect:</strong> {formData.sect}</div>}
                {formData.community && <div className="mini-preview-field"><strong>Community:</strong> {formData.community}</div>}
                {formData.maslak && <div className="mini-preview-field"><strong>Maslak:</strong> {formData.maslak}</div>}
                {formData.namazPractice && <div className="mini-preview-field"><strong>Namaz Practice:</strong> {formData.namazPractice}</div>}
                {formData.hijab && <div className="mini-preview-field"><strong>Hijab/Purdah:</strong> {formData.hijab}</div>}
                {formData.arabicName && <div className="mini-preview-field"><strong>Arabic Name:</strong> {formData.arabicName}</div>}
                {formData.denomination && <div className="mini-preview-field"><strong>Denomination:</strong> {formData.denomination}</div>}
                {formData.churchAffiliation && <div className="mini-preview-field"><strong>Church:</strong> {formData.churchAffiliation}</div>}
                {formData.baptized && <div className="mini-preview-field"><strong>Baptized:</strong> {formData.baptized}</div>}
                {formData.sundayService && <div className="mini-preview-field"><strong>Church Attendance:</strong> {formData.sundayService}</div>}
                {formData.jatha && <div className="mini-preview-field"><strong>Jatha:</strong> {formData.jatha}</div>}
                {formData.amritdhari && <div className="mini-preview-field"><strong>Amritdhari:</strong> {formData.amritdhari}</div>}
                {formData.keshdhari && <div className="mini-preview-field"><strong>Keshdhari:</strong> {formData.keshdhari}</div>}
                {formData.gurudwaraVisit && <div className="mini-preview-field"><strong>Gurudwara Visit:</strong> {formData.gurudwaraVisit}</div>}

                {/* Family Information */}
                {(formData.fatherName || formData.fatherOccupation || formData.motherName || formData.motherOccupation || formData.siblings || formData.siblingsMarried || formData.familyType || formData.familyValues || formData.familyIncome || formData.nativePlace || formData.currentAddress) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Family Information</div>
                )}
                {formData.fatherName && <div className="mini-preview-field"><strong>Father's Name:</strong> {formData.fatherName}</div>}
                {formData.fatherOccupation && <div className="mini-preview-field"><strong>Father's Occupation:</strong> {formData.fatherOccupation}</div>}
                {formData.motherName && <div className="mini-preview-field"><strong>Mother's Name:</strong> {formData.motherName}</div>}
                {formData.motherOccupation && <div className="mini-preview-field"><strong>Mother's Occupation:</strong> {formData.motherOccupation}</div>}
                {formData.siblings && <div className="mini-preview-field"><strong>Siblings:</strong> {formData.siblings}</div>}
                {formData.siblingsMarried && <div className="mini-preview-field"><strong>Siblings Married:</strong> {formData.siblingsMarried}</div>}
                {formData.familyType && <div className="mini-preview-field"><strong>Family Type:</strong> {formData.familyType}</div>}
                {formData.familyValues && <div className="mini-preview-field"><strong>Family Values:</strong> {formData.familyValues}</div>}
                {formData.familyIncome && <div className="mini-preview-field"><strong>Family Income:</strong> {formData.familyIncome}</div>}
                {formData.nativePlace && <div className="mini-preview-field"><strong>Native Place:</strong> {formData.nativePlace}</div>}
                {formData.currentAddress && <div className="mini-preview-field"><strong>Current Address:</strong> {formData.currentAddress}</div>}

                {/* Contact Information */}
                {(formData.phone || formData.email || formData.whatsapp || formData.address) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Contact Information</div>
                )}
                {formData.phone && <div className="mini-preview-field"><strong>Phone:</strong> {formData.phone}</div>}
                {formData.email && <div className="mini-preview-field"><strong>Email:</strong> {formData.email}</div>}
                {formData.whatsapp && <div className="mini-preview-field"><strong>Alternate No:</strong> {formData.whatsapp}</div>}
                {formData.address && <div className="mini-preview-field"><strong>Address:</strong> {formData.address}</div>}

                {/* Partner Preferences */}
                {(formData.partnerAgeRange || formData.partnerHeight || formData.partnerEducation || formData.partnerOccupation || formData.partnerLocation || formData.otherPreferences) && (
                  <div className="preview-section-label" style={{ color: effectiveColor }}>Partner Preferences</div>
                )}
                {formData.partnerAgeRange && <div className="mini-preview-field"><strong>Partner Age Range:</strong> {formData.partnerAgeRange}</div>}
                {formData.partnerHeight && <div className="mini-preview-field"><strong>Partner Height:</strong> {formData.partnerHeight}</div>}
                {formData.partnerEducation && <div className="mini-preview-field"><strong>Partner Education:</strong> {formData.partnerEducation}</div>}
                {formData.partnerOccupation && <div className="mini-preview-field"><strong>Partner Occupation:</strong> {formData.partnerOccupation}</div>}
                {formData.partnerLocation && <div className="mini-preview-field"><strong>Partner Location:</strong> {formData.partnerLocation}</div>}
                {formData.otherPreferences && <div className="mini-preview-field"><strong>Other Preferences:</strong> {formData.otherPreferences}</div>}

                {/* Empty state */}
                {Object.keys(formData).length === 0 && !photo && (
                  <div className="mini-preview-empty">
                    <p>Start filling the form to see your biodata preview here</p>
                  </div>
                )}
              </div>
              </div>{/* end mini-preview-inner-scroll */}
            </div>{/* end mini-biodata-preview-mini */}
            </div>{/* end preview-scroll-wrapper */}

            {/* Action Buttons - Outside the preview box */}
            <div className="preview-actions">
              <div className="preview-buttons-row">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all form data?')) {
                      localStorage.removeItem(STORAGE_KEY);
                      window.location.reload();
                    }
                  }}
                  className="btn btn-outline clear-form-btn"
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-success preview-pay-btn"
                >
                  Preview and Download
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Template Selection - Full Width */}
      <div className="templates-full-width-section" ref={formatsRef}>
        <div className="templates-container">
          <h2 className="section-heading">
            <span className="section-icon">🎨</span>
            Biodata Formats
          </h2>
          <div className="template-grid-large">
            {templates.map((tmpl, index) => (
              <div
                key={tmpl.id}
                className={`template-card ${selectedTemplate === tmpl.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTemplate(tmpl.id);
                  setCustomColor(''); // Reset custom color to use template's default color
                }}
              >
                <div
                  className={`template-preview-box border-template-${tmpl.id}`}
                  style={{
                    background: tmpl.colors.background.toUpperCase() === '#FFFFFF' ? 'white' : tmpl.colors.background,
                    position: 'relative',
                  }}
                >
                  <img
                    className="template-card-border-img"
                    src={generateBorderSVG(tmpl.colors.primary, tmpl.id).replace(/^url\("/, '').replace(/"\)$/, '')}
                    alt=""
                    aria-hidden="true"
                  />
                  <div className="template-number-badge" style={{ backgroundColor: tmpl.colors.primary }}>
                    #{index + 1}
                  </div>
                  <div className="template-preview-content-centered">
                    <h4 className="template-name-inside" style={{ color: tmpl.colors.primary }}>
                      {tmpl.name}
                    </h4>
                    <div className="template-price-container">
                      <div className="template-price-row">
                        <span className="template-price-current">₹11</span>
                        <span className="template-price-original">₹{getOriginalPrice(tmpl.price)}</span>
                      </div>
                      <span className="template-discount-badge">
                        {Math.round((1 - 11 / getOriginalPrice(tmpl.price)) * 100)}% OFF
                      </span>
                    </div>
                  </div>
                </div>
                {selectedTemplate === tmpl.id && (
                  <div className="selected-check-large">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header Color Picker Modal */}
      {showColorModal && (
        <div className="color-modal-overlay" onClick={() => setShowColorModal(false)}>
          <div className="color-modal" onClick={(e) => e.stopPropagation()}>
            <div className="color-modal-header">
              <h3>🎨 Select Color</h3>
              <button onClick={() => setShowColorModal(false)} className="color-modal-close" title="Close">✕</button>
            </div>
            <div className="color-modal-grid">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  className={`color-modal-swatch ${effectiveColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => { setCustomColor(color.value); setShowColorModal(false); }}
                  title={color.name}
                >
                  {effectiveColor === color.value && '✓'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo Cropper Modal */}
      {showCropper && imageSrc && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-modal-header">
              <h3>Crop Your Photo</h3>
              <button onClick={handleCropCancel} className="crop-close-btn">✕</button>
            </div>
            <div className="crop-container">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="crop-controls">
              <label className="zoom-label">
                <span>Zoom:</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="zoom-slider"
                />
              </label>
            </div>
            <div className="crop-modal-footer">
              <button onClick={handleCropCancel} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleCropSave} className="btn btn-success">
                Crop & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBiodataNew;
