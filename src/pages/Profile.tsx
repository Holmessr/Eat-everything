import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Camera, Save, LogOut, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { compressImage } from '../utils/imageCompression';

interface UserProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn(error);
        }

        if (data) {
          setProfile(data);
        } else {
          setProfile({
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
            avatar_url: null,
            bio: '',
          });
        }
      } catch (error) {
        console.error('Error loading user data!', error);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [navigate]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file || !profile) return;

      // Compress avatar before uploading
      // Use lower quality for avatar to keep it small (e.g. 200px is enough for avatar)
      const compressedDataUrl = await compressImage(file, 200, 0.6);
      
      // Convert Data URL back to Blob for upload
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      const compressedFile = new File([blob], file.name, { type: 'image/webp' });

      const fileExt = 'webp'; // Force webp extension
      const filePath = `${profile.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    } catch (error) {
      toast.error('Error uploading avatar!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) return;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile!', error);
      toast.error('Error updating profile!');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
    };

    await updateProfile(updates);
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    setLoading(false);
    toast.success(t('profile.success'));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-8">
      <div className="text-center relative">
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="text-gray-500 mt-1">{t('profile.subtitle')}</p>
        <button
          onClick={handleSignOut}
          className="absolute right-0 top-0 p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">{t('profile.changeAvatar')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.nickname')}</label>
            <input
              name="name"
              defaultValue={profile.name || ''}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.bio')}</label>
            <textarea
              name="bio"
              defaultValue={profile.bio || ''}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder={t('profile.bioPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {t('profile.save')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
