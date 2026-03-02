import { useState } from 'react';
import { Milk, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { insertMilkRecord, fetchAllMilkRecords, type MilkRecord } from '@/lib/supabase';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';
type DownloadStatus = 'idle' | 'loading' | 'error';

/**
 * Converts an array of MilkRecord objects to a CSV string and triggers a download.
 * Uses only browser-native APIs — no CDN or external library required.
 */
function downloadAsExcel(records: MilkRecord[]): void {
  // Build CSV content (Excel opens .csv files natively)
  const header = ['Date', 'MilkDelivered', 'Packets'];
  const rows = records.map((r) => [
    r.Date,
    r.MilkDelivered,
    String(r.Packets),
  ]);

  const csvContent = [header, ...rows]
    .map((row) =>
      row
        .map((cell) => {
          // Escape cells that contain commas, quotes, or newlines
          const str = String(cell);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');

  // Use UTF-8 BOM so Excel recognises the encoding correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'MilkDelivery.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function MilkDeliveryPanel() {
  const [date, setDate] = useState<string>('');
  const [milkDelivered, setMilkDelivered] = useState<'Yes' | 'No' | ''>('');
  const [packets, setPackets] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitError, setSubmitError] = useState<string>('');
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle');
  const [downloadError, setDownloadError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !milkDelivered || !packets) return;

    const packetsNum = parseInt(packets, 10);
    if (isNaN(packetsNum) || packetsNum < 0) {
      setSubmitError('Please enter a valid number of packets.');
      setSubmitStatus('error');
      return;
    }

    setSubmitStatus('loading');
    setSubmitError('');

    const record: MilkRecord = {
      Date: date,
      MilkDelivered: milkDelivered as 'Yes' | 'No',
      Packets: packetsNum,
    };

    const { error } = await insertMilkRecord(record);

    if (error) {
      setSubmitError(error);
      setSubmitStatus('error');
    } else {
      setSubmitStatus('success');
      // Reset form
      setDate('');
      setMilkDelivered('');
      setPackets('');
      // Auto-reset success after 3s
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const handleDownload = async () => {
    setDownloadStatus('loading');
    setDownloadError('');

    const { data, error } = await fetchAllMilkRecords();

    if (error || !data) {
      setDownloadError(error ?? 'Failed to fetch records.');
      setDownloadStatus('error');
      return;
    }

    try {
      downloadAsExcel(data);
      setDownloadStatus('idle');
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to generate file.');
      setDownloadStatus('error');
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
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="milk-date" className="text-sm font-semibold text-primary uppercase tracking-wide">
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

          {/* Milk Delivered */}
          <div className="space-y-1.5">
            <Label htmlFor="milk-delivered" className="text-sm font-semibold text-primary uppercase tracking-wide">
              Milk Delivered
            </Label>
            <Select
              value={milkDelivered}
              onValueChange={(val) => setMilkDelivered(val as 'Yes' | 'No')}
              required
            >
              <SelectTrigger id="milk-delivered" className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select Yes or No" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Number of Packets */}
          <div className="space-y-1.5">
            <Label htmlFor="milk-packets" className="text-sm font-semibold text-primary uppercase tracking-wide">
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitStatus === 'loading' || !date || !milkDelivered || !packets}
            className="w-full"
          >
            {submitStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Record'
            )}
          </Button>

          {/* Submit Feedback */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Record saved successfully!</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError || 'Failed to save record. Please try again.'}</span>
            </div>
          )}
        </form>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Download Excel Button */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloadStatus === 'loading'}
            className="w-full border-primary/50 text-primary hover:bg-primary/10"
          >
            {downloadStatus === 'loading' ? (
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
          {downloadStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{downloadError || 'Failed to download. Please try again.'}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MilkDeliveryPanel;
