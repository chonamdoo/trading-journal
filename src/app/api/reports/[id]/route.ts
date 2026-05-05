import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createReportsCompositionRoot } from '@/features/reports/di.server';
import { mapReportToMonthlyReportResponse } from '@/features/reports/presentation/mappers/report-response.mapper';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;
  return withAuth(req, async (supabase) => {
    try {
      const report = await createReportsCompositionRoot(supabase).getReport.execute(id);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: mapReportToMonthlyReportResponse(report),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
