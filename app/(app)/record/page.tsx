'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/GlassCard';
import { Camera, Image, Loader2, X } from 'lucide-react';
import { cn, generateFoodPhotoPath } from '@/lib/utils';

export default function RecordPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  // 选择图片
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  // 移除图片
  function removePhoto() {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // 提交
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!foodName.trim() && !calories) return;

    setLoading(true);

    const supabase = createClient();

    // 获取用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    let photoUrl: string | null = null;

    // 上传图片
    if (photoFile) {
      const path = generateFoodPhotoPath(user.id);
      const { error: uploadError } = await supabase.storage
        .from('food-photos')
        .upload(path, photoFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setLoading(false);
        alert('图片上传失败，请重试');
        return;
      }

      photoUrl = path;
    }

    // 写入记录
    const { error } = await supabase.from('food_records').insert({
      user_id: user.id,
      custom_name: foodName.trim() || null,
      calories: parseInt(calories) || 0,
      photo_url: photoUrl,
      note: note.trim() || null,
      recorded_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Insert error:', error);
      setLoading(false);
      alert('保存失败，请重试');
      return;
    }

    // 成功，跳回首页
    router.push('/');
    router.refresh();
  }

  return (
    <div className="container pt-4 pb-8 page-enter">
      <h1 className="text-xl font-bold text-text mb-4">记录饮食</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 拍照区域 */}
        <GlassCard className="p-4">
          <label className="text-sm font-medium text-text-sub mb-3 block">
            拍张照（可选）
          </label>

          {photoPreview ? (
            <div className="relative rounded-xl overflow-hidden aspect-square bg-brand/5">
              <img
                src={photoPreview}
                alt="预览"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl bg-brand/5 border-2 border-dashed border-brand/30 flex flex-col items-center justify-center gap-2 tap-scale"
              >
                <Camera className="w-8 h-8 text-brand/60" />
                <span className="text-sm text-brand/70">拍照</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl bg-brand/5 border-2 border-dashed border-brand/30 flex flex-col items-center justify-center gap-2 tap-scale"
              >
                <Image className="w-8 h-8 text-brand/60" />
                <span className="text-sm text-brand/70">相册</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </GlassCard>

        {/* 食物名称 */}
        <GlassCard className="p-4">
          <label className="text-sm font-medium text-text-sub mb-2 block">
            吃了什么
          </label>
          <input
            type="text"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            placeholder="比如：白米饭、鸡胸肉沙拉..."
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'bg-white/50 border border-border',
              'text-text placeholder:text-text-muted',
              'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
              'transition-all',
            )}
            maxLength={50}
          />
        </GlassCard>

        {/* 热量 */}
        <GlassCard className="p-4">
          <label className="text-sm font-medium text-text-sub mb-2 block">
            大约多少大卡
          </label>
          <div className="flex items-end gap-2">
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="230"
              className={cn(
                'flex-1 px-4 py-3 rounded-xl',
                'bg-white/50 border border-border',
                'text-text placeholder:text-text-muted',
                'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
                'transition-all',
                'text-lg font-semibold',
              )}
              min="0"
              max="10000"
            />
            <span className="text-text-sub pb-3">大卡</span>
          </div>
        </GlassCard>

        {/* 备注 */}
        <GlassCard className="p-4">
          <label className="text-sm font-medium text-text-sub mb-2 block">
            备注（可选）
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="吃了多少？和谁一起吃的？"
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-xl resize-none',
              'bg-white/50 border border-border',
              'text-text placeholder:text-text-muted',
              'focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20',
              'transition-all',
            )}
            maxLength={200}
          />
        </GlassCard>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading || (!foodName.trim() && !calories)}
          className={cn(
            'w-full py-4 rounded-2xl',
            'bg-gradient-to-r from-brand to-brand-dark',
            'text-white font-bold text-base',
            'shadow-soft',
            'tap-scale',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2',
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              保存中...
            </>
          ) : (
            '保存记录'
          )}
        </button>
      </form>
    </div>
  );
}
