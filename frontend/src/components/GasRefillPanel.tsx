import { Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function GasRefillPanel() {
  const refillDates = ['8th Dec 2025', '21st Jan 2026', '3rd Feb 2026'];

  return (
    <Card className="border-2 shadow-lg bg-card backdrop-blur h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <span>Home Cooking Gas Refill Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cooking Gas Changed On Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
            Cooking Gas Changed On
          </h3>
          <div className="space-y-1.5 pl-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground min-w-[80px]">Previously on:</span>
              <span className="text-sm font-medium text-foreground">24th Dec 2025</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground min-w-[80px]">Latest on:</span>
              <span className="text-sm font-bold text-accent">26th Jan 2026</span>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Refill Delivered On Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
            Refill Delivered On Below Dates:
          </h3>
          <div className="space-y-1.5 pl-2">
            {refillDates.map((date, index) => (
              <div key={index} className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-foreground">{date}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GasRefillPanel;
