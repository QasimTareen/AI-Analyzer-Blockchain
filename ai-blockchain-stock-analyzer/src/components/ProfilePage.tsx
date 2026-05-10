import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, CheckCircle2, AlertCircle, Camera, Loader2, Calendar, X } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  const formatDate = (date: any) => {
    if (!date) return '---';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        updatedAt: serverTimestamp()
      });
      await refreshProfile();
      setIsEditing(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (.jpg, .png, etc.)');
      return;
    }

    // Check file size (max 1.5MB for base64 storage)
    if (file.size > 1.5 * 1024 * 1024) {
      setError('Image must be smaller than 1.5MB');
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/user/profile-pic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid, photoBase64: base64String })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update profile picture');
        }

        await refreshProfile();
      } catch (err: any) {
        setError(err.message || 'Failed to upload image');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-sans font-black tracking-tight mb-2">User Profile</h1>
        <p className="text-xs opacity-40 font-medium">Manage your personal details and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column - Avatar & Core Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--surface-alpha)] border border-[var(--border-alpha)] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
             <div className="relative group mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--accent-color)] p-1">
                   {profile.photoURL ? (
                     <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full rounded-full object-cover" />
                   ) : (
                     <div className="w-full h-full bg-[var(--bg-color)] flex items-center justify-center text-3xl font-black">
                        {profile.displayName[0]}
                     </div>
                   )}
                </div>
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isLoading} />
                  {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                </label>
             </div>

             <h2 className="text-xl font-bold mb-1">{profile.displayName}</h2>
             <p className="text-xs opacity-40 mb-6">{profile.email}</p>

             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-500">
               <CheckCircle2 className="w-3 h-3" /> Fully Verified
             </div>
          </div>

          <div className="bg-[var(--surface-alpha)] border border-[var(--border-alpha)] rounded-3xl p-6 space-y-4">
             <div className="flex items-center justify-between text-[10px] uppercase tracking-widest opacity-40 font-bold">
               <span>Joined</span>
               <span className="text-[var(--text-color)]">{formatDate(profile.createdAt)}</span>
             </div>
             <div className="flex items-center justify-between text-[10px] uppercase tracking-widest opacity-40 font-bold">
               <span>Account Status</span>
               <span className="text-emerald-500">Active</span>
             </div>
          </div>
        </div>

        {/* Right Column - Forms & Details */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[var(--surface-alpha)] border border-[var(--border-alpha)] rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h3 className="text-lg font-bold">Account Settings</h3>
                <button 
                  onClick={() => {
                    console.log('Edit Profile Clicked');
                    setIsEditing(!isEditing);
                  }}
                  className={cn(
                    "relative z-[60] w-full sm:w-auto px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2",
                    isEditing 
                      ? "bg-rose-500/20 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                      : "bg-[var(--accent-color)] text-[var(--bg-color)] border border-[var(--accent-color)]/20 hover:shadow-[0_0_20px_var(--glow-color)]"
                  )}
                >
                  {isEditing ? <X className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                       <input 
                         type="text" 
                         disabled={!isEditing}
                         className="w-full bg-[var(--bg-color)] border border-[var(--border-alpha)] rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[var(--accent-color)]/50 transition-all disabled:opacity-50"
                         value={displayName}
                         onChange={(e) => setDisplayName(e.target.value)}
                         placeholder="John Doe"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                       <input 
                         type="email" 
                         disabled
                         className="w-full bg-[var(--bg-color)] border border-[var(--border-alpha)] rounded-xl py-3 pl-12 pr-4 text-sm opacity-50 cursor-not-allowed"
                         value={profile.email}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Account Level</label>
                    <div className="relative">
                       <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                       <input 
                         type="text" 
                         disabled
                         className="w-full bg-[var(--bg-color)] border border-[var(--border-alpha)] rounded-xl py-3 pl-12 pr-4 text-sm opacity-50 cursor-not-allowed"
                         value="Institutional Access"
                       />
                    </div>
                 </div>

                 {isEditing && (
                   <button 
                     disabled={isLoading}
                     className="w-full bg-[var(--accent-color)] text-[var(--bg-color)] font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-glow transition-all disabled:opacity-50"
                   >
                     {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                   </button>
                 )}
              </form>
           </div>

           <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-500 mb-1">Security Status</h4>
                <p className="text-xs opacity-50 leading-relaxed">
                  Your account is protected by institutional-grade Google Authentication.
                  All analysis records are encrypted and stored in your private secure ledger.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
