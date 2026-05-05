import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth';
import { createReportsCompositionRoot } from '@/features/reports/di.server';
import type { ReportPeriodType } from '@/features/reports/domain/entities/report-period';
import { mapReportToMonthlyReportResponse } from '@/features/reports/presentation/mappers/report-response.mapper';

export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const { searchParams } = new URL(req.url);
    const periodType = searchParams.get('periodType') as ReportPeriodType | null;

    try {
      const reports = await createReportsCompositionRoot(supabase).listReports.execute({
        userId,
        periodType: periodType ?? undefined,
      });

      return NextResponse.json({
        success: true,
        data: reports.map(mapReportToMonthlyReportResponse),
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '알 수 없는 오류' },
        { status: 400 },
      );
    }
  });
}
