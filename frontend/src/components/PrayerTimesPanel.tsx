import { useEffect, useState } from 'react';
import { Moon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PrayerTime {
  name: string;
  time: string;
}

interface PrayerTimesData {
  prayers: PrayerTime[];
  date: string;
  method: string;
  school: string;
}

// Calculation method constants
const CALCULATION_METHOD = 2; // Islamic Society of North America (ISNA)
const MADHAB_SCHOOL = 0; // 0 = Shafi (Standard), 1 = Hanafi

function PrayerTimesPanel() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert 24-hour time to 12-hour AM/PM format
  const formatTo12Hour = (timeString: string): string => {
    // Extract HH:mm from the time string (ignoring any suffix like " (IST)")
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return timeString;
    
    const hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes} ${period}`;
  };

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Rajakilpakkam coordinates
        const latitude = 12.9121;
        const longitude = 80.1533;
        
        // Get current date in DD-MM-YYYY format
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        
        // Fetch prayer times with correct Shafi configuration
        // method: calculation method for Fajr/Isha angles
        // school: 0 = Shafi (Standard), 1 = Hanafi (affects Asr timing)
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${CALCULATION_METHOD}&school=${MADHAB_SCHOOL}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch prayer times');
        }
        
        const data = await response.json();
        
        if (data.code !== 200 || !data.data) {
          throw new Error('Invalid response from prayer times API');
        }
        
        const timings = data.data.timings;
        const meta = data.data.meta;
        
        // Extract the five daily prayers
        const prayers: PrayerTime[] = [
          { name: 'Fajr', time: timings.Fajr },
          { name: 'Dhuhr', time: timings.Dhuhr },
          { name: 'Asr', time: timings.Asr },
          { name: 'Maghrib', time: timings.Maghrib },
          { name: 'Isha', time: timings.Isha },
        ];
        
        // Get method name from API response, fallback to method ID
        const methodName = meta?.method?.name || `Method ${CALCULATION_METHOD}`;
        const schoolName = MADHAB_SCHOOL === 0 ? 'Shafi' : 'Hanafi';
        
        setPrayerTimes({
          prayers,
          date: data.data.date.readable,
          method: methodName,
          school: schoolName,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prayer times');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerTimes();
    
    // Refresh prayer times at midnight every day
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      fetchPrayerTimes();
      // Then update every 24 hours
      const dailyInterval = setInterval(fetchPrayerTimes, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  return (
    <Card className="border-2 shadow-lg bg-card backdrop-blur h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl font-bold text-center flex items-center justify-center gap-2">
          <Moon className="w-5 h-5 text-primary" />
          <span>Prayer Times</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground text-center">
          Rajakilpakkam ({MADHAB_SCHOOL === 0 ? 'Shafi' : 'Hanafi'})
        </p>
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
        
        {prayerTimes && !loading && (
          <div className="space-y-3">
            {/* Prayer Times Section */}
            {prayerTimes.prayers.map((prayer) => (
              <div
                key={prayer.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="font-semibold text-sm md:text-base">
                  {prayer.name}
                </span>
                <span className="font-bold text-base md:text-lg text-primary tabular-nums">
                  {formatTo12Hour(prayer.time)}
                </span>
              </div>
            ))}
            
            {/* Date and Calculation Method Info */}
            <div className="pt-2 mt-2 border-t border-border/50 space-y-1">
              {prayerTimes.date && (
                <p className="text-xs text-muted-foreground text-center">
                  {prayerTimes.date}
                </p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                {prayerTimes.method} • {prayerTimes.school} Madhab
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PrayerTimesPanel;
