import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function useGooglePicker() {
  const [loaded, setLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/google/token');
        if (!response.ok) {
          console.log('User not connected to Google.');
          return;
        }
        const data = await response.json();
        setAccessToken(data.accessToken);
      } catch (error) {
        console.error('Failed to fetch Google access token:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const onApiLoad = () => {
      window.gapi.load('picker', () => setLoaded(true));
    };

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = onApiLoad;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openPicker = (callback: (docs: any[]) => void) => {
    if (!loaded || !accessToken) {
      toast.error('Google Picker is not available. Please connect your Google account in Settings.');
      return;
    }

    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    view.setMimeTypes('application/vnd.google-apps.document,application/vnd.google-apps.spreadsheet,application/vnd.google-apps.presentation,application/pdf,image/jpeg,image/png');

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setAppId(GOOGLE_CLIENT_ID)
      .setOAuthToken(accessToken)
      .addView(view)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const pickedDocs = data.docs.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            url: doc.url,
            iconUrl: doc.iconUrl,
          }));
          callback(pickedDocs);
        }
      })
      .build();
    picker.setVisible(true);
  };

  return { openPicker, isPickerReady: loaded && !!accessToken };
}