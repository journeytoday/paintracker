import { useState, useEffect, useRef } from 'react';
import { useAnatomyStore } from '../store/anatomyStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertCircle, Loader2, Upload, Download, ChevronDown, ChevronUp, Image as ImageIcon, X, Plus, Trash2, CreditCard as Edit, Save, FileText, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';

interface PainLog {
  id: string;
  created_at: string;
  pain_level: number;
  note: string;
  body_part_id: string | null;
  image_url: string | null;
  injury_id: string | null;
  day_number: number | null;
}

interface Injury {
  id: string;
  user_id: string;
  body_part_id: string;
  title: string;
  created_at: string;
  last_logged_at: string;
  is_active: boolean;
  logs: PainLog[];
}

const getPainColor = (level: number) => {
  if (level >= 1 && level <= 3) return 'bg-green-100 text-green-800 border-green-200';
  if (level >= 4 && level <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  // Set both dates to start of day to avoid timezone/timing issues
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.floor((nowDay.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function PainLogPanel() {
  const { selectedPart } = useAnatomyStore();
  const { user } = useAuth();
  const [painLevel, setPainLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [injuryTitle, setInjuryTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storeData, setStoreData] = useState(true);
  const [expandedInjury, setExpandedInjury] = useState<string | null>(null);
  const [deletingInjury, setDeletingInjury] = useState<string | null>(null);
  const [trackingInjuryId, setTrackingInjuryId] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editPainLevel, setEditPainLevel] = useState(5);
  const [editNotes, setEditNotes] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [savingLog, setSavingLog] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [editingInjuryId, setEditingInjuryId] = useState<string | null>(null);
  const [editInjuryTitle, setEditInjuryTitle] = useState('');
  const [savingInjury, setSavingInjury] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportingInjury, setExportingInjury] = useState<Injury | null>(null);
  const [isSameDayUpdate, setIsSameDayUpdate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadInjuries();
      loadPreferences();
    }
  }, [user, selectedPart]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('store_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setStoreData(data.store_data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadInjuries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let injuriesQuery = supabase
        .from('injuries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_logged_at', { ascending: false });

      if (selectedPart) {
        injuriesQuery = injuriesQuery.eq('body_part_id', selectedPart);
      }

      const { data: injuriesData, error: injuriesError } = await injuriesQuery;
      if (injuriesError) {
        console.error('Error loading injuries:', injuriesError);
        throw injuriesError;
      }

      console.log('Loaded injuries:', injuriesData);

      const injuriesWithLogs = await Promise.all(
        (injuriesData || []).map(async (injury) => {
          const { data: logsData, error: logsError } = await supabase
            .from('logs')
            .select('*')
            .eq('injury_id', injury.id)
            .order('day_number', { ascending: true });

          if (logsError) {
            console.error('Error loading logs for injury:', injury.id, logsError);
            throw logsError;
          }
          console.log(`Logs for injury ${injury.id}:`, logsData);
          return { ...injury, logs: logsData || [] };
        })
      );

      console.log('Injuries with logs:', injuriesWithLogs);
      setInjuries(injuriesWithLogs);
    } catch (error) {
      console.error('Error loading injuries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to save your pain entries.');
      return;
    }

    // Validate injury title when no body part is selected and not tracking existing injury
    if (!trackingInjuryId && !selectedPart && !injuryTitle.trim()) {
      alert('Please enter an injury name or select a body part.');
      return;
    }

    setSubmitting(true);
    try {
      if (storeData) {
        let imageUrl = null;

        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('pain-images')
            .upload(fileName, imageFile);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from('pain-images').getPublicUrl(fileName);

          imageUrl = publicUrl;
        }

        let injuryId = trackingInjuryId;
        let dayNumber = 1;

        if (trackingInjuryId) {
          const injury = injuries.find((inj) => inj.id === trackingInjuryId);
          if (injury) {
            if (isSameDayUpdate && injury.logs.length > 0) {
              const lastLog = injury.logs[injury.logs.length - 1];
              dayNumber = lastLog.day_number;
            } else {
              dayNumber = injury.logs.length + 1;
            }
            await supabase
              .from('injuries')
              .update({ last_logged_at: new Date().toISOString() })
              .eq('id', trackingInjuryId);
          }
        } else {
          // Check if an injury already exists for this body part
          const existingInjury = selectedPart
            ? injuries.find((inj) => inj.body_part_id === selectedPart)
            : null;

          if (existingInjury) {
            // Use existing injury
            injuryId = existingInjury.id;
            if (isSameDayUpdate && existingInjury.logs.length > 0) {
              const lastLog = existingInjury.logs[existingInjury.logs.length - 1];
              dayNumber = lastLog.day_number;
            } else {
              dayNumber = existingInjury.logs.length + 1;
            }
            await supabase
              .from('injuries')
              .update({ last_logged_at: new Date().toISOString() })
              .eq('id', existingInjury.id);
          } else {
            // Create new injury
            const title = injuryTitle.trim() || (selectedPart ? `${selectedPart} Pain` : 'New Injury');
            const { data: newInjury, error: injuryError } = await supabase
              .from('injuries')
              .insert({
                user_id: user.id,
                body_part_id: selectedPart || null,
                title: title,
              })
              .select()
              .single();

            if (injuryError) throw injuryError;
            injuryId = newInjury.id;
          }
        }

        const { error } = await supabase.from('logs').insert({
          user_id: user.id,
          body_part_id: selectedPart || null,
          pain_level: painLevel,
          note: notes,
          image_url: imageUrl,
          injury_id: injuryId,
          day_number: dayNumber,
        });

        if (error) throw error;
        await loadInjuries();
      }

      setPainLevel(5);
      setNotes('');
      setInjuryTitle('');
      handleRemoveImage();
      setTrackingInjuryId(null);
      setIsSameDayUpdate(false);
    } catch (error) {
      console.error('Error submitting check-in:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackNewDay = (injuryId: string, bodyPart: string) => {
    setIsSameDayUpdate(false);
    setTrackingInjuryId(injuryId);
    if (bodyPart && bodyPart !== selectedPart) {
      useAnatomyStore.getState().selectPart(bodyPart);
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPainLevel(5);
    setNotes('');
    setInjuryTitle('');
    handleRemoveImage();
  };

  const handleSameDayUpdate = (injuryId: string, bodyPart: string) => {
    setIsSameDayUpdate(true);
    setTrackingInjuryId(injuryId);
    if (bodyPart && bodyPart !== selectedPart) {
      useAnatomyStore.getState().selectPart(bodyPart);
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setPainLevel(5);
    setNotes('');
    setInjuryTitle('');
    handleRemoveImage();
  };

  const handleDeleteInjury = async (injury: Injury) => {
    if (!user) {
      alert('Please sign in to delete entries.');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete this injury and all ${injury.logs.length} log entries? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingInjury(injury.id);
    try {
      for (const log of injury.logs) {
        if (log.image_url) {
          const fileName = log.image_url.split('/').pop();
          if (fileName) {
            await supabase.storage.from('pain-images').remove([`${user.id}/${fileName}`]);
          }
        }
      }

      const { error } = await supabase.from('injuries').delete().eq('id', injury.id);

      if (error) throw error;

      await loadInjuries();
      setExpandedInjury(null);
    } catch (error) {
      console.error('Error deleting injury:', error);
      alert('Failed to delete injury. Please try again.');
    } finally {
      setDeletingInjury(null);
    }
  };

  const handleEditLog = (log: PainLog) => {
    setEditingLogId(log.id);
    setEditPainLevel(log.pain_level);
    setEditNotes(log.note || '');
    setEditImagePreview(log.image_url);
    setEditImageFile(null);
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditPainLevel(5);
    setEditNotes('');
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleSaveEdit = async (logId: string, currentImageUrl: string | null) => {
    if (!user) return;

    setSavingLog(true);
    try {
      let imageUrl = currentImageUrl;

      // Handle image changes
      if (editImageFile) {
        // Upload new image
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('pain-images')
          .upload(fileName, editImageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('pain-images').getPublicUrl(fileName);

        imageUrl = publicUrl;

        // Delete old image if it exists
        if (currentImageUrl) {
          const oldFileName = currentImageUrl.split('/').pop();
          if (oldFileName) {
            await supabase.storage.from('pain-images').remove([`${user.id}/${oldFileName}`]);
          }
        }
      } else if (!editImagePreview && currentImageUrl) {
        // Image was removed
        const oldFileName = currentImageUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('pain-images').remove([`${user.id}/${oldFileName}`]);
        }
        imageUrl = null;
      }

      // Update log in database
      const { error } = await supabase
        .from('logs')
        .update({
          pain_level: editPainLevel,
          note: editNotes,
          image_url: imageUrl,
        })
        .eq('id', logId);

      if (error) throw error;

      await loadInjuries();
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating log:', error);
      alert('Failed to update entry. Please try again.');
    } finally {
      setSavingLog(false);
    }
  };

  const handleEditInjury = (injury: Injury) => {
    setEditingInjuryId(injury.id);
    setEditInjuryTitle(injury.title);
  };

  const handleCancelInjuryEdit = () => {
    setEditingInjuryId(null);
    setEditInjuryTitle('');
  };

  const handleSaveInjury = async (injuryId: string) => {
    if (!user || !editInjuryTitle.trim()) return;

    setSavingInjury(true);
    try {
      const { error } = await supabase
        .from('injuries')
        .update({
          title: editInjuryTitle.trim(),
        })
        .eq('id', injuryId);

      if (error) throw error;

      await loadInjuries();
      handleCancelInjuryEdit();
    } catch (error) {
      console.error('Error updating injury:', error);
      alert('Failed to update injury. Please try again.');
    } finally {
      setSavingInjury(false);
    }
  };

  const handleDeleteLog = async (log: PainLog, injuryId?: string) => {
    if (!user) {
      alert('Please sign in to delete entries.');
      return;
    }

    if (!confirm('Are you sure you want to delete this log entry? This action cannot be undone.')) {
      return;
    }

    setDeletingLogId(log.id);
    try {
      if (log.image_url) {
        const fileName = log.image_url.split('/').pop();
        if (fileName) {
          await supabase.storage.from('pain-images').remove([`${user.id}/${fileName}`]);
        }
      }

      const { error } = await supabase.from('logs').delete().eq('id', log.id);

      if (error) throw error;

      if (injuryId) {
        const { data: remainingLogs } = await supabase
          .from('logs')
          .select('id')
          .eq('injury_id', injuryId);

        if (!remainingLogs || remainingLogs.length === 0) {
          await supabase.from('injuries').delete().eq('id', injuryId);
        }
      }

      await loadInjuries();
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log. Please try again.');
    } finally {
      setDeletingLogId(null);
    }
  };

  const handleExportClick = (injury: Injury) => {
    if (!user) {
      alert('Please sign in to export your data.');
      return;
    }
    setExportingInjury(injury);
    setShowExportDialog(true);
  };

  const exportAsTXT = (injury: Injury) => {
    const content = `
${injury.title}
Location: ${injury.body_part_id || 'Not specified'}
Started: ${new Date(injury.created_at).toLocaleDateString()}
Last Updated: ${new Date(injury.last_logged_at).toLocaleDateString()}
Total Logs: ${injury.logs.length}
Generated: ${new Date().toLocaleDateString()}

Progress Timeline:
${injury.logs
  .map(
    (log) => `
Day ${log.day_number} - ${formatDate(log.created_at)}
Pain Level: ${log.pain_level}/10
Notes: ${log.note || 'No notes'}
-------------------
`
  )
  .join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${injury.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportDialog(false);
    setExportingInjury(null);
  };

  const exportAsPDF = async (injury: Injury) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    const getPainColorRGB = (level: number): [number, number, number] => {
      if (level >= 1 && level <= 3) return [34, 197, 94];
      if (level >= 4 && level <= 7) return [234, 179, 8];
      return [239, 68, 68];
    };

    const loadImageAsBase64 = async (url: string): Promise<string | null> => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    };

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(injury.title, margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Location: ${injury.body_part_id || 'Not specified'}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Started: ${new Date(injury.created_at).toLocaleDateString()}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(
      `Last Updated: ${new Date(injury.last_logged_at).toLocaleDateString()}`,
      margin,
      yPosition
    );
    yPosition += lineHeight;
    const maxDay = injury.logs.length > 0 ? Math.max(...injury.logs.map(log => log.day_number)) : 0;
    doc.text(`Total Days Tracked: ${maxDay}`, margin, yPosition);
    yPosition += lineHeight;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += lineHeight * 2;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pain Chart', margin, yPosition);
    yPosition += lineHeight * 1.5;

    const chartWidth = pageWidth - margin * 2;
    const chartHeight = 40;
    const barWidth = Math.min(chartWidth / injury.logs.length, 30);
    const barSpacing = 2;

    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition, chartWidth, chartHeight);

    injury.logs.forEach((log, index) => {
      const barHeight = (log.pain_level / 10) * (chartHeight - 10);
      const xPos = margin + index * (barWidth + barSpacing) + 5;
      const yPos = yPosition + chartHeight - barHeight - 5;

      const [r, g, b] = getPainColorRGB(log.pain_level);
      doc.setFillColor(r, g, b);
      doc.rect(xPos, yPos, barWidth - barSpacing, barHeight, 'F');

      doc.setFontSize(7);
      doc.setTextColor(0, 0, 0);
      doc.text(`D${log.day_number}`, xPos + (barWidth - barSpacing) / 2, yPosition + chartHeight + 5, {
        align: 'center',
      });
      doc.text(`${log.pain_level}`, xPos + (barWidth - barSpacing) / 2, yPos - 2, {
        align: 'center',
      });
    });

    yPosition += chartHeight + 15;

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Legend:', margin, yPosition);
    yPosition += 5;

    const legendItems = [
      { color: [34, 197, 94] as [number, number, number], label: 'Mild (1-3)' },
      { color: [234, 179, 8] as [number, number, number], label: 'Moderate (4-7)' },
      { color: [239, 68, 68] as [number, number, number], label: 'Severe (8-10)' },
    ];

    legendItems.forEach((item, idx) => {
      const xOffset = margin + idx * 45;
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.rect(xOffset, yPosition - 2, 4, 4, 'F');
      doc.text(item.label, xOffset + 6, yPosition);
    });

    yPosition += lineHeight * 2;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Progress Timeline', margin, yPosition);
    yPosition += lineHeight * 1.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const log of injury.logs) {
      if (yPosition > pageHeight - margin - 70) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${log.day_number} - ${formatDate(log.created_at)}`, margin, yPosition);
      yPosition += lineHeight;

      doc.setFont('helvetica', 'normal');
      const [r, g, b] = getPainColorRGB(log.pain_level);
      doc.setTextColor(r, g, b);
      doc.text(`Pain Level: ${log.pain_level}/10`, margin, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += lineHeight;

      const noteLines = doc.splitTextToSize(
        `Notes: ${log.note || 'No notes'}`,
        pageWidth - margin * 2
      );
      noteLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin - lineHeight) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      if (log.image_url) {
        yPosition += 5;
        const imageData = await loadImageAsBase64(log.image_url);
        if (imageData) {
          const imgWidth = 60;
          const imgHeight = 60;

          if (yPosition + imgHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }

          try {
            doc.addImage(imageData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 5;
          } catch (error) {
            console.error('Error adding image to PDF:', error);
          }
        }
      }

      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
      yPosition += lineHeight * 1.5;
    }

    doc.save(`${injury.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
    setShowExportDialog(false);
    setExportingInjury(null);
  };

  return (
    <div className="w-96 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900">
          {selectedPart || 'Injury Tracking'}
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          {selectedPart ? 'Track symptoms for this area' : 'Select a body part to begin'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div ref={formRef} className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              {trackingInjuryId
                ? `Track Day ${
                    (injuries.find((inj) => inj.id === trackingInjuryId)?.logs.length || 0) + 1
                  }`
                : 'New Injury'}
            </h3>
            {trackingInjuryId && (
              <button
                onClick={() => setTrackingInjuryId(null)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {trackingInjuryId && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Tracking Mode:</strong> Adding Day{' '}
                {(injuries.find((inj) => inj.id === trackingInjuryId)?.logs.length || 0) + 1} to{' '}
                <strong>
                  {injuries.find((inj) => inj.id === trackingInjuryId)?.title}
                </strong>
              </p>
            </div>
          )}
          {!user && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                Sign in to save your pain entries and track your progress over time.
              </p>
            </div>
          )}
          {user && !storeData && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                Data storage is disabled. This entry will not be saved to your history.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!trackingInjuryId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Injury Name {!selectedPart && <span className="text-primary">*</span>}
                </label>
                <input
                  type="text"
                  value={injuryTitle}
                  onChange={(e) => setInjuryTitle(e.target.value)}
                  placeholder={selectedPart ? `e.g., ${selectedPart} Pain` : 'e.g., Lower Back Pain'}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
                {!selectedPart && (
                  <p className="text-xs text-slate-500 mt-1">
                    Required when no body part is selected
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pain Level
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="pain-slider"
                />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Mild (1)</span>
                  <span className="text-2xl font-bold text-primary">{painLevel}</span>
                  <span>Severe (10)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How does it feel? What triggers it?"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Add Photo (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary hover:bg-slate-50 transition-colors flex flex-col items-center space-y-2"
                >
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                  <span className="text-sm text-slate-600">Click to upload</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Check-in</span>
              )}
            </button>
          </form>
        </div>

        <div className="p-4 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
              Injury Tracking
            </h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
            </div>
          ) : user ? (
            injuries.length > 0 ? (
              <div className="space-y-3">
                {injuries.map((injury) => {
                  const latestLog = injury.logs[injury.logs.length - 1];
                  const avgPainLevel =
                    injury.logs.reduce((sum, log) => sum + log.pain_level, 0) / injury.logs.length;

                  return (
                    <div
                      key={injury.id}
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                    >
                      {editingInjuryId === injury.id ? (
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Injury Title
                            </label>
                            <input
                              type="text"
                              value={editInjuryTitle}
                              onChange={(e) => setEditInjuryTitle(e.target.value)}
                              placeholder="e.g., Right Knee Pain"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveInjury(injury.id)}
                              disabled={savingInjury || !editInjuryTitle.trim()}
                              className="flex-1 bg-primary hover:bg-primary-600 text-white px-3 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-1 disabled:opacity-50"
                            >
                              {savingInjury ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">Saving...</span>
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  <span className="text-sm">Save</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleCancelInjuryEdit}
                              disabled={savingInjury}
                              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-1 disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                              <span className="text-sm">Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedInjury(expandedInjury === injury.id ? null : injury.id)
                          }
                          className="w-full p-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-base font-semibold text-slate-900">
                                  {injury.title}
                                </h4>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditInjury(injury);
                                  }}
                                  className="text-slate-400 hover:text-primary transition-colors"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {(() => {
                                  const maxDay = injury.logs.length > 0
                                    ? Math.max(...injury.logs.map(log => log.day_number))
                                    : 0;
                                  return `${maxDay} ${maxDay === 1 ? 'day' : 'days'}`;
                                })()} • Last logged {formatDate(injury.last_logged_at)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPainColor(
                                  Math.round(avgPainLevel)
                                )}`}
                              >
                                Avg {Math.round(avgPainLevel)}/10
                              </span>
                              {expandedInjury === injury.id ? (
                                <ChevronUp className="h-4 w-4 text-slate-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                          {latestLog.note && expandedInjury !== injury.id && (
                            <p className="text-sm text-slate-600 line-clamp-1">
                              Latest: {latestLog.note}
                            </p>
                          )}
                        </button>
                      )}
                      {expandedInjury === injury.id && (
                        <div className="px-4 pb-4 border-t border-slate-100">
                          <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
                            {injury.logs.map((log) => (
                              <div
                                key={log.id}
                                className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                              >
                                {editingLogId === log.id ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold text-primary">
                                          Day {log.day_number}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          {formatDate(log.created_at)}
                                        </span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Pain Level
                                      </label>
                                      <div className="space-y-1">
                                        <input
                                          type="range"
                                          min="1"
                                          max="10"
                                          value={editPainLevel}
                                          onChange={(e) => setEditPainLevel(Number(e.target.value))}
                                          className="pain-slider"
                                        />
                                        <div className="flex justify-between text-xs text-slate-600">
                                          <span>Mild (1)</span>
                                          <span className="text-lg font-bold text-primary">
                                            {editPainLevel}
                                          </span>
                                          <span>Severe (10)</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Notes
                                      </label>
                                      <textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        placeholder="How does it feel? What triggers it?"
                                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Photo
                                      </label>
                                      <input
                                        ref={editFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleEditImageSelect}
                                        className="hidden"
                                      />
                                      {editImagePreview ? (
                                        <div className="relative">
                                          <img
                                            src={editImagePreview}
                                            alt="Preview"
                                            className="w-full h-24 object-cover rounded-lg border border-slate-300"
                                          />
                                          <button
                                            type="button"
                                            onClick={handleRemoveEditImage}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => editFileInputRef.current?.click()}
                                          className="w-full border-2 border-dashed border-slate-300 rounded-lg p-2 hover:border-primary hover:bg-white transition-colors flex flex-col items-center space-y-1"
                                        >
                                          <ImageIcon className="h-6 w-6 text-slate-400" />
                                          <span className="text-xs text-slate-600">Add photo</span>
                                        </button>
                                      )}
                                    </div>
                                    <div className="flex space-x-2 pt-2">
                                      <button
                                        onClick={() => handleSaveEdit(log.id, log.image_url)}
                                        disabled={savingLog}
                                        className="flex-1 bg-primary hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-1 disabled:opacity-50"
                                      >
                                        {savingLog ? (
                                          <>
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span className="text-xs">Saving...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Save className="h-3 w-3" />
                                            <span className="text-xs">Save</span>
                                          </>
                                        )}
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        disabled={savingLog}
                                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-1 disabled:opacity-50"
                                      >
                                        <X className="h-3 w-3" />
                                        <span className="text-xs">Cancel</span>
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs font-bold text-primary">
                                            Day {log.day_number}
                                          </span>
                                          <span className="text-xs text-slate-500">
                                            {formatDate(log.created_at)}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPainColor(
                                            log.pain_level
                                          )}`}
                                        >
                                          {log.pain_level}/10
                                        </span>
                                        <button
                                          onClick={() => handleEditLog(log)}
                                          disabled={deletingLogId === log.id}
                                          className="text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLog(log, injury.id)}
                                          disabled={deletingLogId === log.id}
                                          className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                        >
                                          {deletingLogId === log.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-3.5 w-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                    {log.note && (
                                      <p className="text-sm text-slate-600 mt-1">{log.note}</p>
                                    )}
                                    {log.image_url && (
                                      <img
                                        src={log.image_url}
                                        alt={`Day ${log.day_number}`}
                                        className="w-full rounded-lg border border-slate-200 mt-2"
                                      />
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex space-x-2">
                              {(() => {
                                const maxDayNumber = injury.logs.length > 0
                                  ? Math.max(...injury.logs.map(log => log.day_number))
                                  : 0;
                                const nextDayNumber = maxDayNumber + 1;

                                return (
                                  <>
                                    <button
                                      onClick={() => handleTrackNewDay(injury.id, injury.body_part_id)}
                                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-2"
                                    >
                                      <Plus className="h-4 w-4" />
                                      <span>Day {nextDayNumber}</span>
                                    </button>
                                    {injury.logs.length > 0 && (
                                      <button
                                        onClick={() => handleSameDayUpdate(injury.id, injury.body_part_id)}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-2"
                                      >
                                        <RefreshCw className="h-4 w-4" />
                                        <span>Update Day {maxDayNumber}</span>
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleExportClick(injury)}
                                className="flex-1 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-2 border border-primary-200"
                              >
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                              </button>
                              <button
                                onClick={() => handleDeleteInjury(injury)}
                                disabled={deletingInjury === injury.id}
                                className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                              >
                                {deletingInjury === injury.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Deleting...</span>
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  No injuries tracked yet. Click on a body part and create your first injury above.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
              <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Sign in to start tracking your injuries and symptoms.
              </p>
            </div>
          )}
        </div>
      </div>

      {showExportDialog && exportingInjury && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Export Format</h3>
            <p className="text-sm text-slate-600 mb-6">
              Choose the format to export <strong>{exportingInjury.title}</strong>
            </p>
            <div className="space-y-3">
              <button
                onClick={() => exportAsTXT(exportingInjury)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 px-4 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-3 border border-slate-300"
              >
                <FileText className="h-5 w-5" />
                <span>Export as TXT</span>
              </button>
              <button
                onClick={() => exportAsPDF(exportingInjury)}
                className="w-full bg-primary hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center space-x-3"
              >
                <Download className="h-5 w-5" />
                <span>Export as PDF</span>
              </button>
            </div>
            <button
              onClick={() => {
                setShowExportDialog(false);
                setExportingInjury(null);
              }}
              className="w-full mt-4 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors border border-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
