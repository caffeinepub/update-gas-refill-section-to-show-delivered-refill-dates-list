import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Loader2, Thermometer } from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherData {
  currentTemperature: number;
  rainProbability: number;
}

function WeatherPanel() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Rajakilpakkam coordinates
        const latitude = 12.9121;
        const longitude = 80.1533;

        // Fetch weather data with precipitation probability
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=precipitation_probability&timezone=Asia/Kolkata&forecast_days=1`,
        );

        if (!weatherResponse.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const weatherData = await weatherResponse.json();

        // Get current temperature
        const currentTemperature = Math.round(
          weatherData.current.temperature_2m,
        );

        // Calculate average rain probability for today
        const precipProbabilities =
          weatherData.hourly.precipitation_probability || [];
        const avgRainProbability =
          precipProbabilities.length > 0
            ? Math.round(
                precipProbabilities.reduce(
                  (sum: number, val: number) => sum + val,
                  0,
                ) / precipProbabilities.length,
              )
            : 0;

        setWeather({
          currentTemperature,
          rainProbability: avgRainProbability,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather every hour
    const interval = setInterval(fetchWeather, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-2 shadow-lg bg-card backdrop-blur h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl font-bold">
          Weather - Rajakilpakkam
        </CardTitle>
        <p className="text-xs text-muted-foreground">Current conditions</p>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-destructive">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {weather && !loading && (
          <div className="space-y-4">
            {/* Current Temperature */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Thermometer className="w-6 h-6 text-primary" />
                <span className="font-semibold text-base">Temperature</span>
              </div>
              <span className="font-bold text-2xl text-primary tabular-nums">
                {weather.currentTemperature}°C
              </span>
            </div>

            {/* Rain Probability */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <CloudRain className="w-6 h-6 text-blue-400" />
                <span className="font-semibold text-base">
                  Rain Probability
                </span>
              </div>
              <span className="font-bold text-2xl text-blue-400 tabular-nums">
                {weather.rainProbability}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WeatherPanel;
