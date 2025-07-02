'use client';

import { useState } from 'react';
import TimeLLMForecastingComponent from '../../components/TimeLLMModel';
import { productData } from '../../lib/data';

export default function AIForecastingPage() {
  const [forecastData, setForecastData] = useState({});

  const handleForecastUpdate = (productId, forecast) => {
    setForecastData(prev => ({
      ...prev,
      [productId]: forecast
    }));
  };

  return (
    <div>
      <TimeLLMForecastingComponent 
        productData={productData} 
        onForecastUpdate={handleForecastUpdate} 
      />
    </div>
  );
}