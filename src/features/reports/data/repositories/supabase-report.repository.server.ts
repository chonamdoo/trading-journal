import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import type { Report } from '../../domain/entities/report';
import type { ReportPeriodType } from '../../domain/entities/report-period';
import type { ReportRepository } from '../../domain/repositories/report.repository';
import type { ReportRowDto } from '../dto/report-row.dto';
import { mapReportRowToReport } from '../mappers/report.mapper';

type Client = SupabaseClient<Database>;

export class SupabaseReportRepository implements ReportRepository {
  constructor(private readonly supabase: Client) {}

  async findManyByUser(userId: string, periodType?: ReportPeriodType): Promise<Report[]> {
    let query = this.supabase
      .from('monthly_reports')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (periodType) {
      query = query.eq('period_type', periodType);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return ((data ?? []) as ReportRowDto[]).map(mapReportRowToReport);
  }

  async findById(reportId: string): Promise<Report | null> {
    const { data, error } = await this.supabase
      .from('monthly_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) throw new Error(error.message);
    if (!data) return null;

    return mapReportRowToReport(data as ReportRowDto);
  }
}
