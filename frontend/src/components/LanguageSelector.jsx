import { Select, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiUrl, getApiKey } from '../utils/apiConfig';

const LanguageSelector = ({ value, onChange, label = 'Language' }) => {
  const [languages, setLanguages] = useState([{ value: 'en', label: 'English' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        // Get the API key
        const apiKey = getApiKey();
        if (!apiKey) {
          console.warn('No API key available for fetching languages');
          return;
        }

        const response = await axios.get(getApiUrl('supported-languages'), {
          headers: {
            'X-API-KEY': apiKey,
          },
        });

        if (response.data.success) {
          const formattedLanguages = response.data.languages.map((lang) => ({
            value: lang.code,
            label: lang.name,
          }));
          setLanguages(formattedLanguages);
        }
      } catch (error) {
        console.error('Error fetching supported languages:', error);
        // Fallback to a default set of languages if API fails
        setLanguages([
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish (Español)' },
          { value: 'fr', label: 'French (Français)' },
          { value: 'de', label: 'German (Deutsch)' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  return (
    <div>
      <Text size="sm" mb={5}>
        {label}
      </Text>
      <Select
        data={languages}
        value={value}
        onChange={onChange}
        placeholder="Select language"
        disabled={loading}
        searchable
        nothingFound="No languages found"
      />
    </div>
  );
};

export default LanguageSelector;
