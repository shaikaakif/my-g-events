import React, { useState, useEffect, useCallback, useId } from 'react';
import { useApp } from '../../lib/data/AppContext';
import { EventGalleryItem, EventItem } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Filter,
  Camera,
  Calendar,
  User,
  X,
  Sparkles,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

export const EventGallery: React.FC = () => {
  const { repo, currentUser, showToast } = useApp();
  const fileInputId = useId();

  const [galleryItems, setGalleryItems] = useState<EventGalleryItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadEventId, setUploadEventId] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadImageUrl, setUploadImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lightbox Modal State
  const [activeLightboxItem, setActiveLightboxItem] = useState<EventGalleryItem | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allEvents, items] = await Promise.all([
        repo.getEvents(),
        repo.getGalleryItems(selectedEventFilter),
      ]);
      setEvents(allEvents);
      setGalleryItems(items);
      if (!uploadEventId && allEvents.length > 0) {
        setUploadEventId(allEvents[0].id);
      }
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setIsLoading(false);
    }
  }, [repo, selectedEventFilter, uploadEventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle local file selection and convert to Base64 data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit. Please select a smaller photo.', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setUploadImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('You must be logged in to upload photos.', 'warning');
      return;
    }
    if (!previewImage && !uploadImageUrl.trim()) {
      showToast('Please select an image file or provide an image URL.', 'warning');
      return;
    }
    if (!uploadCaption.trim()) {
      showToast('Please provide a short caption.', 'warning');
      return;
    }

    const matchedEvent = events.find((ev) => ev.id === uploadEventId);

    setIsSubmitting(true);
    try {
      const newItem = await repo.addGalleryItem({
        event_id: uploadEventId || undefined,
        event_title: matchedEvent?.title || 'Campus Event',
        image_url: previewImage || uploadImageUrl.trim(),
        caption: uploadCaption.trim(),
        uploaded_by_name: currentUser.full_name,
        uploaded_by_role: currentUser.role,
      });

      setGalleryItems((prev) => [newItem, ...prev]);
      showToast('Photo uploaded successfully to Campus Gallery!', 'success');
      setIsUploadModalOpen(false);
      setUploadCaption('');
      setUploadImageUrl('');
      setPreviewImage(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>Campus Moments</span>
          </div>
          <h1 className="font-serif-heading font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
            Campus Event Gallery
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Photos, prototypes, team sessions, and ceremony milestones across all collegiate activities.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Event Photo</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-stone-700">Filter by Event:</span>
        </div>

        <select
          value={selectedEventFilter}
          onChange={(e) => setSelectedEventFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 outline-none focus:border-emerald-500"
        >
          <option value="all">All Events ({galleryItems.length} photos)</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {/* Gallery Photo Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500">Loading campus photo gallery...</div>
      ) : galleryItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-serif-heading font-bold text-lg text-stone-900">No photos yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Be the first to upload an event snapshot or presentation photo to this album.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
          >
            Upload Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightboxItem(item)}
              className="group rounded-2xl bg-white border border-emerald-100/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Image Container with Fallback */}
              <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Graceful fallback if image URL fails
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 text-center';
                      fallback.innerHTML = `<svg class="w-8 h-8 mb-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg><span class="text-xs font-bold">${item.event_title || 'Campus Event'}</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />

                {/* Event Pill Overlay */}
                {item.event_title && (
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-md text-emerald-900 shadow-xs">
                    {item.event_title}
                  </div>
                )}

                {/* View Icon Overlay */}
                <div className="absolute bottom-2.5 right-2.5 p-1.5 rounded-xl bg-stone-900/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Caption & Metadata */}
              <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                <p className="font-serif-heading font-semibold text-xs sm:text-sm text-stone-900 line-clamp-2">
                  {item.caption}
                </p>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1 font-medium truncate max-w-[140px]">
                    <User className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{item.uploaded_by_name}</span>
                  </span>
                  <span className="font-mono-tech text-[10px] text-stone-400 shrink-0">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveLightboxItem(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveLightboxItem(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={activeLightboxItem.image_url}
                alt={activeLightboxItem.caption}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-5 bg-stone-900 text-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {activeLightboxItem.event_title || 'Campus Event'}
                </span>
                <span className="text-xs text-stone-400">
                  Uploaded by {activeLightboxItem.uploaded_by_name} ({activeLightboxItem.uploaded_by_role || 'Member'})
                </span>
              </div>
              <h3 className="font-serif-heading font-bold text-lg text-white">
                {activeLightboxItem.caption}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setPreviewImage(null);
          setUploadImageUrl('');
        }}
        title="Upload Event Photo"
        description="Share moments, workspace prototypes, presentation slides, or ceremony snapshots with the campus community."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Select Event *
            </label>
            <select
              value={uploadEventId}
              onChange={(e) => setUploadEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 outline-none focus:border-emerald-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Caption *
            </label>
            <input
              type="text"
              required
              value={uploadCaption}
              onChange={(e) => setUploadCaption(e.target.value)}
              placeholder="e.g., Final prototype demonstration before judges"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 outline-none focus:border-emerald-500"
            />
          </div>

          {/* Photo File Picker or URL */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Photo *
            </span>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={fileInputId}
                className="p-4 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 text-center cursor-pointer transition-colors"
              >
                <Camera className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-emerald-800">
                  Choose photo from device
                </span>
                <span className="block text-[11px] text-stone-500 mt-0.5">
                  PNG, JPG, WEBP up to 5MB
                </span>
                <input
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <div className="relative">
                <input
                  type="url"
                  value={uploadImageUrl}
                  onChange={(e) => {
                    setUploadImageUrl(e.target.value);
                    setPreviewImage(e.target.value);
                  }}
                  placeholder="Or paste external image URL..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Live Preview */}
            {previewImage && (
              <div className="relative rounded-2xl overflow-hidden border border-emerald-200 h-40 bg-stone-100 mt-2">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setUploadImageUrl('');
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-stone-900/70 text-white hover:bg-stone-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Uploading...' : 'Publish Photo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
