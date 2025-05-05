'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUserStore } from '@/store/userStore';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useUser } from '@/lib/api/hooks';

export function UpdateProfileForm({ profile, onSuccess }: { 
  profile: { name?: string; bio?: string; avatar?: string } | null;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(profile?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useUserStore();
  const { refetch: refetchUser } = useUser();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      if (name) formData.append('name', name);
      if (bio) formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'x-user-address': user?.walletAddress || '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error.message);
      }

      const { data: userData } = await refetchUser();
      if (userData?.data?.user) {
        setUser(userData.data.user);
      }

      toast.success('Profile updated successfully');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {previewUrl ? (
            <AvatarImage src={previewUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {previewUrl && <AvatarFallback>{name?.[0] || 'U'}</AvatarFallback>}
        </Avatar>
        <div>
          <label htmlFor="avatar" className="text-sm font-medium">
            Change Avatar
          </label>
          <div className="mt-1">
            <label
              htmlFor="avatar"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <User className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or GIF (MAX. 2MB)
                </p>
              </div>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium">
          Bio
        </label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
} 