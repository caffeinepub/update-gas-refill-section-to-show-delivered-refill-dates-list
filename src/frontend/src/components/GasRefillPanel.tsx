import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flame } from "lucide-react";

const gasChangedPrevious = ["24th Dec 2025", "26th Jan 2026"];
const gasChangedLatest = "2nd Mar 2026";

const refillPrevious = ["8th Dec 2025", "21st Jan 2026", "3rd Feb 2026"];
const refillLatest = "19th Mar 2026";

function GasRefillPanel() {
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
          <div className="space-y-2 pl-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Previously on:
              </span>
              <div className="space-y-0.5 pl-2">
                {gasChangedPrevious.map((date) => (
                  <div
                    key={date}
                    className="text-sm font-medium text-foreground"
                  >
                    {date}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Latest on:</span>
              <div className="pl-2">
                <span className="text-sm font-bold text-accent">
                  {gasChangedLatest}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Refill Delivered On Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
            Refill Delivered On Below Dates:
          </h3>
          <div className="space-y-2 pl-2">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">
                Previously on:
              </span>
              <div className="space-y-0.5 pl-2">
                {refillPrevious.map((date) => (
                  <div
                    key={date}
                    className="text-sm font-medium text-foreground"
                  >
                    {date}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Latest on:</span>
              <div className="pl-2">
                <span className="text-sm font-bold text-accent">
                  {refillLatest}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GasRefillPanel;
