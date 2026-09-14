import { Platform } from 'react-native';

/**
 * Converts ImagePicker asset or URI into a permanent Base64 Data URI
 * that survives browser page refresh (F5), AsyncStorage, and Supabase storage.
 * On Web, blob: URLs are ephemeral memory objects that get destroyed on F5.
 */
export async function getPermanentImageUri(asset) {
  if (!asset) return null;

  // 1. If expo-image-picker already gave base64 data
  if (asset.base64) {
    return `data:image/jpeg;base64,${asset.base64}`;
  }

  const uri = typeof asset === 'string' ? asset : asset.uri;
  if (!uri) return null;

  // 2. Already a data URI
  if (uri.startsWith('data:')) {
    return uri;
  }

  // 3. If on Web and it's a blob: URL, convert it to Base64 Data URL
  if (Platform.OS === 'web' && uri.startsWith('blob:')) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          resolve(uri);
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Failed to convert blob to data URI:', err);
      return uri;
    }
  }

  return uri;
}

/**
 * Sanitizes avatar URI by stripping out dummy 1x1 test green pixel base64 or empty strings.
 */
export function sanitizeAvatarUri(uri) {
  if (!uri) return null;
  if (typeof uri === 'string') {
    const trimmed = uri.trim();
    if (
      !trimmed ||
      trimmed === 'green' ||
      trimmed.includes('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
    ) {
      return null;
    }
  }
  return uri;
}

/**
 * Provides a high-definition delicious food photo fallback for Thai canteen dishes
 * when merchant has not uploaded a custom photo.
 */
export function getFoodImageFallback(foodName = '') {
  const n = (foodName || '').toLowerCase();
  if (n.includes('ขนมถ้วย') || n.includes('ขนม') || n.includes('ของหวาน') || n.includes('หวาน')) {
    return 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('ก๋วยเตี๋ยว') || n.includes('บะหมี่') || n.includes('ราเมน') || n.includes('เส้น') || n.includes('ต้มยำ')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('กะเพรา') || n.includes('หมูกรอบ') || n.includes('ข้าว') || n.includes('ผัด')) {
    return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('ไก่') || n.includes('ทอด')) {
    return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('ชา') || n.includes('กาแฟ') || n.includes('นม') || n.includes('น้ำ') || n.includes('เครื่องดื่ม') || n.includes('โซดา')) {
    return 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=600&q=80';
  }
  if (n.includes('ส้มตำ') || n.includes('ยำ') || n.includes('ลาบ') || n.includes('น้ำตก')) {
    return 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
}

