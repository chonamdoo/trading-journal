import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database, TargetInsert, TargetUpdate } from '@/lib/supabase/types';
import type { CapitalTarget, CapitalTargetUpdate } from '../../domain/entities/capital-target';
import type { CapitalTargetRepository } from '../../domain/repositories/capital-target.repository';
import type { CapitalTargetRowDto } from '../dto/capital-target-row.dto';
import { mapTargetRowToCapitalTarget } from '../mappers/capital-target.mapper';

type Client = SupabaseClient<Database>;

export class SupabaseCapitalTargetRepository implements CapitalTargetRepository {
  constructor(private readonly supabase: Client) {}

  async findManyByUser(userId: string): Promise<CapitalTarget[]> {
    const { data, error } = await this.supabase
      .from('targets')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return ((data ?? []) as CapitalTargetRowDto[]).map(mapTargetRowToCapitalTarget);
  }

  async create(userId: string, label: string, amount: number): Promise<CapitalTarget> {
    const { data: existing } = await this.supabase
      .from('targets')
      .select('sort_order')
      .eq('user_id', userId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
    const insert: TargetInsert = {
      user_id: userId,
      label,
      amount,
      sort_order: nextOrder,
    };

    const { data, error } = await this.supabase
      .from('targets')
      .insert(insert)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTargetRowToCapitalTarget(data as CapitalTargetRowDto);
  }

  async update(targetId: string, update: CapitalTargetUpdate): Promise<CapitalTarget> {
    const mappedUpdate = Object.fromEntries(
      Object.entries({
        label: update.label,
        amount: update.amount,
        sort_order: update.sortOrder,
      }).filter(([, value]) => value !== undefined),
    ) as TargetUpdate;

    const { data, error } = await this.supabase
      .from('targets')
      .update(mappedUpdate)
      .eq('id', targetId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapTargetRowToCapitalTarget(data as CapitalTargetRowDto);
  }

  async reorder(userId: string, targetIds: string[]): Promise<void> {
    const updates = targetIds.map((id, index) => (
      this.supabase
        .from('targets')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('user_id', userId)
    ));

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) throw new Error(failed.error.message);
  }

  async delete(targetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('targets')
      .delete()
      .eq('id', targetId);

    if (error) throw new Error(error.message);
  }
}
