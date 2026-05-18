import { useState } from 'react';
import { useAuthStore } from '@/shared/store/auth-store';
import { useToastStore } from '@/shared/store/toast-store';
import { updateCurrentUserProfile, changeCurrentUserPassword } from '@/shared/api/auth-api';
import { User, Lock, Save, Shield, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageModal from '@/shared/ui/ImageModal';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  // Profile data states
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [imageUrl, setImageUrl] = useState(user?.image_url || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const updatedUser = await updateCurrentUserProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        image_url: imageUrl.trim() || null,
      });
      setUser(updatedUser);
      setProfileSuccess('¡Perfil actualizado con éxito!');
      addToast('Perfil actualizado correctamente', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al actualizar perfil';
      setProfileError(msg);
      addToast(msg, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsChangingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      await changeCurrentUserPassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('¡Tu contraseña ha sido cambiada correctamente!');
      addToast('Contraseña cambiada con éxito', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Error al cambiar contraseña. Verificá tu clave actual.';
      setPasswordError(msg);
      addToast(msg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Sleek Profile Header */}
      <div className="card-premium p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {user?.image_url ? (
            <img
              src={user.image_url}
              alt="Foto de perfil"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-primary-500/20 shadow-lg shadow-primary-500/10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                setImageUrl(user.image_url || '');
                setPreviewOpen(true);
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.first_name}`;
              }}
            />
          ) : (
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-500/20">
              {user?.first_name?.[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-surface-custom-400 text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
            user?.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]' :
            user?.role === 'GESTOR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            user?.role === 'STAFF' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
          }`}>
            {user?.role === 'CLIENTE' ? 'Cliente' : user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="card-premium p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-primary-500/10 rounded-xl text-primary-400">
              <User size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Datos Personales</h2>
          </div>

          {profileSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-sm font-medium">
              <CheckCircle2 size={18} />
              <p>{profileSuccess}</p>
            </div>
          )}

          {profileError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm font-medium">
              <AlertCircle size={18} />
              <p>{profileError}</p>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Live Profile Image Preview & URL Input */}
            <div className="flex flex-col items-center gap-4 border-b border-white/5 pb-6">
              <div className="relative group">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Foto de perfil de prueba"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary-500/20 shadow-lg shadow-primary-500/10 group-hover:scale-105 transition-transform cursor-zoom-in hover:brightness-90"
                    onClick={() => setPreviewOpen(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}`;
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                    {firstName?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="w-full space-y-2">
                <label htmlFor="image_url" className="block text-[10px] font-black text-surface-custom-400 uppercase tracking-widest mb-1.5 ml-1 text-center">
                  Foto de Perfil (URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    id="image_url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="input-premium text-xs flex-grow"
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                  />
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-widest shrink-0"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-surface-custom-500 text-center">Pega un enlace de imagen (opcional) para tu foto de perfil.</p>
              </div>
            </div>

            <div>
              <label htmlFor="first_name" className="block text-[10px] font-black text-surface-custom-400 uppercase tracking-widest mb-1.5 ml-1">
                Nombre
              </label>
              <input
                type="text"
                id="first_name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-premium text-sm"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-[10px] font-black text-surface-custom-400 uppercase tracking-widest mb-1.5 ml-1">
                Apellido
              </label>
              <input
                type="text"
                id="last_name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-premium text-sm"
                placeholder="Tu apellido"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] font-black text-surface-custom-400 uppercase tracking-widest mb-1.5 ml-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium text-sm"
                placeholder="tu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn-premium w-full flex items-center justify-center gap-2 mt-6 py-3.5"
            >
              {isUpdatingProfile ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Guardar Datos</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card-premium p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="p-2 bg-secondary-500/10 rounded-xl text-secondary-400">
              <Lock size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Cambiar Contraseña</h2>
          </div>

          {passwordSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-400 text-sm font-medium">
              <CheckCircle2 size={18} />
              <p>{passwordSuccess}</p>
            </div>
          )}

          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm font-medium">
              <AlertCircle size={18} />
              <p>{passwordError}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="old_password" className="block text-[10px] font-black text-surface-custom-400 uppercase tracking-widest mb-1.5 ml-1">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  id="old_password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="input-premium text-sm pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-custom-400 hover:text-white transition-colors"
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new_password" className="block text-[10px] font-black text-surface-custom-400 uppercase tracking-widest mb-1.5 ml-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="new_password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-premium text-sm pr-12"
                  placeholder="Min. 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-custom-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-[10px] font-black text-surface-custom-400 uppercase tracking-widest mb-1.5 ml-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirm_password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-premium text-sm pr-12"
                  placeholder="Repetir nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-custom-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-premium w-full flex items-center justify-center gap-2 mt-6 py-3.5 bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/20 hover:shadow-secondary-500/40"
            >
              {isChangingPassword ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={16} />
                  <span>Actualizar Contraseña</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <ImageModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${firstName ? encodeURIComponent(firstName) : 'user'}&backgroundColor=0f172a,1e293b,334155&textColor=38bdf8,f43f5e,10b981&bold=true`}
      />
    </div>
  );
}
