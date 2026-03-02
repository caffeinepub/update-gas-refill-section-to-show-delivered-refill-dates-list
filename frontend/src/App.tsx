import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WeatherPanel from '@/components/WeatherPanel';
import PrayerTimesPanel from '@/components/PrayerTimesPanel';
import GasRefillPanel from '@/components/GasRefillPanel';
import MilkDeliveryPanel from '@/components/MilkDeliveryPanel';

function calculateDaysToMay30ExcludingSundays(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Target: 30th May of current year; if already past, use next year
  let targetYear = today.getFullYear();
  const targetDate = new Date(targetYear, 4, 30); // Month 4 = May, day 30
  targetDate.setHours(0, 0, 0, 0);

  if (today > targetDate) {
    targetYear += 1;
    targetDate.setFullYear(targetYear);
  }

  let count = 0;
  const current = new Date(today);

  while (current <= targetDate) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, exclude it
    if (dayOfWeek !== 0) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

function App() {
  const [daysToMay30, setDaysToMay30] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const updateCounter = () => {
      setCurrentDate(new Date());
      setDaysToMay30(calculateDaysToMay30ExcludingSundays());
    };

    // Initial calculation
    updateCounter();

    // Update at midnight every day
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      updateCounter();
      const dailyInterval = setInterval(updateCounter, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine the target May 30 year for display
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const may30ThisYear = new Date(today.getFullYear(), 4, 30);
  may30ThisYear.setHours(0, 0, 0, 0);
  const may30Year = today > may30ThisYear ? today.getFullYear() + 1 : today.getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Section with Weather, Prayer Times, and Countdown */}
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {/* Weather Panel - Left */}
          <div className="w-full">
            <WeatherPanel />
          </div>

          {/* Prayer Times Panel - Center */}
          <div className="w-full">
            <PrayerTimesPanel />
          </div>

          {/* Countdown Counter - Right */}
          <div className="w-full">
            <Card className="border-2 shadow-lg bg-card backdrop-blur h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg md:text-xl font-bold text-center flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>No. of days to complete MAM PMC</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Days to 30th May */}
                <div className="text-center space-y-1">
                  <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Days to 30th May {may30Year}
                  </p>
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative text-7xl md:text-8xl font-black text-primary tabular-nums leading-none">
                      {daysToMay30}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground/80">
                    (excluding Sundays)
                  </p>
                </div>

                {/* Date Info */}
                <div className="pt-3 border-t border-border/50 text-center">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Today: <span className="font-semibold text-foreground">{formatDate(currentDate)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Second Row: Gas Refill Panel + Milk Delivery Panel */}
        <div className="max-w-7xl mx-auto mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="w-full">
              <GasRefillPanel />
            </div>
            <div className="w-full">
              <MilkDeliveryPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-muted-foreground">
          {/* Additional content can be added here if needed */}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()}. Built with love using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'unknown-app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors underline underline-offset-4"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
