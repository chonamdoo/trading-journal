import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/types';
import { SupabaseCapitalTargetRepository } from './data/repositories/supabase-capital-target.repository.server';
import { createCreateCapitalTargetUseCase } from './domain/usecases/create-capital-target.usecase';
import { createDeleteCapitalTargetUseCase } from './domain/usecases/delete-capital-target.usecase';
import { createListCapitalTargetsUseCase } from './domain/usecases/list-capital-targets.usecase';
import { createUpdateCapitalTargetUseCase } from './domain/usecases/update-capital-target.usecase';

export function createCapitalTargetsCompositionRoot(supabase: SupabaseClient<Database>) {
  const capitalTargetRepository = new SupabaseCapitalTargetRepository(supabase);

  return {
    createCapitalTarget: createCreateCapitalTargetUseCase(capitalTargetRepository),
    deleteCapitalTarget: createDeleteCapitalTargetUseCase(capitalTargetRepository),
    listCapitalTargets: createListCapitalTargetsUseCase(capitalTargetRepository),
    updateCapitalTarget: createUpdateCapitalTargetUseCase(capitalTargetRepository),
  };
}
