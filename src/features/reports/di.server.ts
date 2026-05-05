import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import { SupabaseReportRepository } from './data/repositories/supabase-report.repository.server';
import { createGetReportUseCase } from './domain/usecases/get-report.usecase';
import { createListReportsUseCase } from './domain/usecases/list-reports.usecase';

export function createReportsCompositionRoot(supabase: SupabaseClient<Database>) {
  const reportRepository = new SupabaseReportRepository(supabase);

  return {
    getReport: createGetReportUseCase(reportRepository),
    listReports: createListReportsUseCase(reportRepository),
  };
}
