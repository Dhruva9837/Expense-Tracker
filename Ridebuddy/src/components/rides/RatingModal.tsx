'use client';

import { useState } from 'react';
import { Star, MessageSquare, Send, X } from 'lucide-react';

interface RatingModalProps {
  rideId: string;
  driverId: string;
  driverName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => Promise<void>;
}

export default function RatingModal({ rideName, driverName, isOpen, onClose, onSubmit }: any) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    setSubmitting(true);
    await onSubmit(rating, review);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface w-full max-w-md rounded-[2.5rem] shadow-2xl border border-divider overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <div className="bg-accent-burst p-10 text-center text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors active:scale-90">
            <X className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20 backdrop-blur-xl rotate-12">
            <Star className="w-10 h-10 text-warning fill-warning" />
          </div>
          <h2 className="text-xl font-black mb-2 uppercase tracking-tighter">Mission Debrief</h2>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Rank your interaction with {driverName}</p>
        </div>

        <div className="p-10 space-y-10">
          {/* Star Rating */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-all active:scale-75 hover:scale-110"
              >
                <Star 
                  className={`w-10 h-10 transition-all ${
                    (hover || rating) >= star ? 'text-warning fill-warning filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-divider/20 fill-divider/10'
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-textSecondary uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-accent" /> Log Statement
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What made this journey exceptional?"
              className="w-full h-32 p-5 bg-surface-elevated border border-divider rounded-2xl outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all font-bold text-textPrimary placeholder:text-textSecondary/30 placeholder:font-bold text-sm resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="w-full btn-primary py-5 flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-30 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-[0.3em]">{submitting ? 'Transmitting...' : 'Upload Log'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
