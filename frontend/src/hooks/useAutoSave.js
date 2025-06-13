// src/hooks/useAutoSave.js
import { useEffect, useState } from 'react';

const useAutoSave = ({ initialValues, onSave, interval = 60000 }) => {
  const [values, setValues] = useState(initialValues);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Object.keys(values).length > 0) {
        onSave(values);
        setLastSaved(new Date());
      }
    }, interval);

    return () => clearInterval(timer);
  }, [values, onSave, interval]);

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return {
    values,
    handleChange,
    lastSaved
  };
};

export default useAutoSave;