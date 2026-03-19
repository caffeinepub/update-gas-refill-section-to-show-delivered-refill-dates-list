import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type MilkRecord,
  fetchAllMilkRecords,
  insertMilkRecord,
} from "@/lib/supabase";
import { CheckCircle, Download, Loader2, Milk, XCircle } from "lucide-react";
import { useState } from "react";

type SubmitStatus = "idle" | "loading" | "success" | "error";
type DownloadStatus = "idle" | "loading" | "error";

function downloadAsExcel(records: MilkRecord[]): void {
  const header = ["Date", "MilkDelivered", "Packets"];
  const rows = records.map((r) => [
    r.Date,
    r.MilkDelivered ? "Yes" : "No",
    String(r.Packets),
  ]);

  const csvContent = [header, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(","),
    )
    .join("\r\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "MilkDelivery.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function MilkDeliveryPanel() {
  const [date, setDate] = useState<string>("");
  const [milkDelivered, setMilkDelivered] = useState<"Yes" | "No" | "">("");
  const [packets, setPackets] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState<string>("");
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");
  const [downloadError, setDownloadError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !milkDelivered || !packets) return;

    const packetsNum = Number.parseInt(packets, 10);
    if (Number.isNaN(packetsNum) || packetsNum < 0) {
      setSubmitError("Please enter a valid number of packets.");
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("loading");
    setSubmitError("");

    try {
      await insertMilkRecord({
        Date: date,
        MilkDelivered: milkDelivered === "Yes",
        Packets: packetsNum,
      });
      setSubmitStatus("success");
      setDate("");
      setMilkDelivered("");
      setPackets("");
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to save record. Please try again.",
      );
      setSubmitStatus("error");
    }
  };

  const handleDownload = async () => {
    setDownloadStatus("loading");
    setDownloadError("");

    try {
      const records = await fetchAllMilkRecords();
      downloadAsExcel(records);
      setDownloadStatus("idle");
    } catch (err) {
      setDownloadError(
        err instanceof Error
          ? err.message
          : "Failed to download. Please try again.",
      );
      setDownloadStatus("error");
    }
  };

  return (
    <Card className="border-2 shadow-lg bg-card backdrop-blur h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
          <Milk className="w-5 h-5 text-primary" />
          <span>Milk Packet Delivery Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="milk-date"
              className="text-sm font-semibold text-primary uppercase tracking-wide"
            >
              Date
            </Label>
            <Input
              id="milk-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="milk-delivered"
              className="text-sm font-semibold text-primary uppercase tracking-wide"
            >
              Milk Delivered
            </Label>
            <Select
              value={milkDelivered}
              onValueChange={(val) => setMilkDelivered(val as "Yes" | "No")}
            >
              <SelectTrigger
                id="milk-delivered"
                className="bg-secondary border-border text-foreground"
              >
                <SelectValue placeholder="Select Yes or No" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="milk-packets"
              className="text-sm font-semibold text-primary uppercase tracking-wide"
            >
              Number of Packets
            </Label>
            <Input
              id="milk-packets"
              type="number"
              min="0"
              value={packets}
              onChange={(e) => setPackets(e.target.value)}
              placeholder="Enter number of packets"
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <Button
            type="submit"
            disabled={
              submitStatus === "loading" || !date || !milkDelivered || !packets
            }
            className="w-full"
          >
            {submitStatus === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Record"
            )}
          </Button>

          {submitStatus === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Record saved successfully!</span>
            </div>
          )}
          {submitStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {submitError || "Failed to save record. Please try again."}
              </span>
            </div>
          )}
        </form>

        <div className="border-t border-border/50" />

        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloadStatus === "loading"}
            className="w-full border-primary/50 text-primary hover:bg-primary/10"
          >
            {downloadStatus === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download as Excel
              </>
            )}
          </Button>
          {downloadStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {downloadError || "Failed to download. Please try again."}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MilkDeliveryPanel;
