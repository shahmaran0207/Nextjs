import { useState, useEffect } from "react";

export interface WeatherData {
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  windSpeed: number | null;
}

export interface AirQualityData {
  pm10: number | null;
  pm25: number | null;
  station: string;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, airRes] = await Promise.all([
          fetch("/api/weather/busan"),
          fetch("/api/airquality/busan"),
        ]);

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json();
          setWeather(weatherData);
        }

        if (airRes.ok) {
          const airData = await airRes.json();
          setAirQuality(airData);
        }
      } catch (err) {
        console.error("날씨/대기질 데이터 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // 10분마다 갱신
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  return { weather, airQuality, isLoading };
}
