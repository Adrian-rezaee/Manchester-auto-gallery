import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, User, Phone, Mail, Car, ArrowRight, Sparkles } from 'lucide-react';
import { VEHICLES, HIDDEN } from '../../data/vehicles';

interface PrivateViewingModalProps {
  isOpen: boolean;
  preselectedVehicleId?: string;
  onClose: () => void;
}

export const PrivateViewingModal: React.FC<PrivateViewingModalProps> = ({
  isOpen,
  preselectedVehicleId,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    vehicleId: preselectedVehicleId || 'general',
    ndaRequired: true,
    transportAssistance: false,
    notes: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div data-veltrix-modal="booking" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-2xl overflow-y-auto">
      <div
        className="relative w-full max-w-xl bg-paper border-2 border-[#D4AF37]/40 rounded-3xl shadow-[0_25px_80px_rgba(212,175,55,0.25)] overflow-hidden my-auto p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-paper border border-[#D4AF37]/35 text-muted hover:text-ink hover:border-[#D4AF37] transition-colors flex items-center justify-center shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm border border-[#D4AF37]/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-gold-deep uppercase font-bold">
                  CONFIDENTIAL PROTOCOL
                </span>
              </div>
              <h3 className="font-display font-black text-2xl md:text-3xl text-ink">
                Book Private Viewing
              </h3>
              <p className="text-xs text-body">
                {HIDDEN}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase text-gold-deep font-bold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gold-mid" />
                  <span>Full Legal Name / Representative</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="His Excellency / Sheikh / Mr. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-warm border border-[#D4AF37]/35 text-sm text-ink focus:outline-none focus:border-[#D4AF37] shadow-xs transition-colors font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-gold-deep font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gold-mid" />
                    <span>WhatsApp / Mobile</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+971 50 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-warm border border-[#D4AF37]/35 text-sm text-ink focus:outline-none focus:border-[#D4AF37] shadow-xs transition-colors font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-gold-deep font-bold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-mid" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="client@sovereign.ae"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-warm border border-[#D4AF37]/35 text-sm text-ink focus:outline-none focus:border-[#D4AF37] shadow-xs transition-colors font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-gold-deep font-bold flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-gold-mid" />
                    <span>Motorcar of Interest</span>
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-warm border border-[#D4AF37]/35 text-sm text-ink focus:outline-none focus:border-[#D4AF37] shadow-xs transition-colors font-sans"
                  >
                    <option value="general">Entire DIFC Sanctuary Collection</option>
                    {VEHICLES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.manufacturer} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono uppercase text-gold-deep font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-mid" />
                    <span>Preferred Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-warm border border-[#D4AF37]/35 text-sm text-ink focus:outline-none focus:border-[#D4AF37] shadow-xs transition-colors font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-[#D4AF37]/20">
                <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-body hover:text-ink">
                  <input
                    type="checkbox"
                    checked={formData.ndaRequired}
                    onChange={(e) => setFormData({ ...formData, ndaRequired: e.target.checked })}
                    className="w-4 h-4 rounded border-[#D4AF37] bg-paper accent-[#D4AF37]"
                  />
                  <span>Execute Non-Disclosure Agreement prior to arrival</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-body hover:text-ink">
                  <input
                    type="checkbox"
                    checked={formData.transportAssistance}
                    onChange={(e) => setFormData({ ...formData, transportAssistance: e.target.checked })}
                    className="w-4 h-4 rounded border-[#D4AF37] bg-paper accent-[#D4AF37]"
                  />
                  <span>Chauffeured Rolls-Royce / DIFC Helipad transfer requested</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-4 rounded-sm border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#FFF0A8] to-[#C29B28] text-[#0E1013] font-display text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:scale-101 transition-all flex items-center justify-center gap-2"
              >
                <span>Confirm Protocol Appointment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-black text-2xl text-ink">
                Protocol Request Confirmed
              </h3>
              <p className="text-xs text-body max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-ink">{formData.name}</strong>. Your dossier has been routed to our Senior Client Officer. A confidential calendar link and security protocol voucher has been dispatched to your contact.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-warm border border-[#D4AF37]/35 text-left text-xs font-mono space-y-1.5 max-w-sm mx-auto shadow-xs">
              <div className="flex justify-between">
                <span className="text-muted">Reference:</span>
                <span className="text-gold-mid font-black">VLTX-DIFC-{Math.floor(1000 + Math.random() * 9000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Location:</span>
                <span className="text-ink font-semibold">White Marble Pavilion, DIFC Gate 4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Date:</span>
                <span className="text-ink font-semibold">{formData.preferredDate || 'To be confirmed'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-7 py-2.5 rounded-sm border border-[#D4AF37]/50 bg-paper hover:bg-warm text-xs font-display font-bold uppercase tracking-wider text-ink shadow-sm transition-all"
            >
              Close Dossier
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
