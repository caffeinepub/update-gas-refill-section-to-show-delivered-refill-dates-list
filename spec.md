# Specification

## Summary
**Goal:** Fix the `fetchAllMilkRecords` function so that the "Download as Excel" button no longer throws a NetworkError when fetching records from the Supabase `MilkDB` table.

**Planned changes:**
- Update `fetchAllMilkRecords` in `frontend/src/lib/supabase.ts` to use the correct REST URL (`https://ppebfdrluntbglqlreuz.supabase.co/rest/v1/MilkDB?select=*`) with proper `apikey` and `Authorization: Bearer` headers using the anon key.
- Ensure the existing `insertMilkRecord` functionality remains unchanged.

**User-visible outcome:** Clicking "Download as Excel" in the MilkDeliveryPanel successfully fetches all rows from MilkDB and downloads a `.xlsx` file containing the Date, MilkDelivered, and Packets columns without any NetworkError.
