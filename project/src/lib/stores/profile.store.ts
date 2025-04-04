import { create } from 'zustand';
import { api } from '../api/axios';
import { ProfileState, ProfileFormData } from '../types/profile';
import { fileToBase64 } from '../utils/file-upload';

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/profile');
      set({ profile: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: ProfileFormData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put('/profile', data);
      set({ profile: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update profile',
        isLoading: false,
      });
    }
  },

  uploadAvatar: async (fileOrBase64: File | string) => {
    try {
      set({ isLoading: true, error: null });
      
      let base64Image: string;
      let filename: string | undefined;
      
      // Convert file to base64 if it's a File object
      if (fileOrBase64 instanceof File) {
        base64Image = await fileToBase64(fileOrBase64);
        filename = fileOrBase64.name;
      } else {
        // It's already a base64 string
        base64Image = fileOrBase64;
      }
      
      // Send to API
      const response = await api.post('/profile/avatar', {
        avatar: base64Image,
        filename
      });
      
      // Update profile with new avatar URL
      set((state) => ({
        profile: state.profile
          ? { ...state.profile, avatarUrl: response.data.avatarUrl }
          : null,
        isLoading: false
      }));
      
      return response.data.avatarUrl;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload avatar',
        isLoading: false,
      });
      return null;
    }
  },

  removeAvatar: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.delete('/profile/avatar');
      
      // Remove avatar URL from profile
      set((state) => ({
        profile: state.profile
          ? { ...state.profile, avatarUrl: undefined }
          : null,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove avatar',
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 
