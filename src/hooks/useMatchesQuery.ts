import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listMatches,
  getMatch,
  createMatch,
  joinMatch,
  markReady,
  reportResult,
  createDispute,
  submitEvidence,
  CreateMatchData,
  JoinMatchData,
  MarkReadyData,
  ReportResultData,
  CreateDisputeData,
  SubmitEvidenceData,
  ListMatchesParams,
} from '../api/matches';
import { useToast } from '../components/ui/Toast';
import type { Match } from '../types';

/**
 * Query keys for matches
 */
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (filters?: ListMatchesParams) => [...matchKeys.lists(), filters] as const,
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (id: string) => [...matchKeys.details(), id] as const,
};

/**
 * Hook to list matches with filters
 */
export const useMatches = (params?: ListMatchesParams) => {
  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: () => listMatches(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to get a single match
 */
export const useMatch = (matchId: string) => {
  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: () => getMatch(matchId),
    enabled: !!matchId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

/**
 * Hook to create a match
 */
export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreateMatchData) => createMatch(data),
    onSuccess: (newMatch) => {
      // Invalidate matches list to refetch
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

      // Optimistically add to cache
      queryClient.setQueryData(matchKeys.detail(newMatch.id), newMatch);

      toast.success('Match created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create match.';
      toast.error(message);
    },
  });
};

/**
 * Hook to join a match
 */
export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: JoinMatchData }) =>
      joinMatch(matchId, data),
    onSuccess: (updatedMatch) => {
      // Update match in cache
      queryClient.setQueryData(matchKeys.detail(updatedMatch.id), updatedMatch);

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

      toast.success('Joined match successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to join match.';
      toast.error(message);
    },
  });
};

/**
 * Hook to mark ready/not ready
 */
export const useMarkReady = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: MarkReadyData }) =>
      markReady(matchId, data),
    onMutate: async ({ matchId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: matchKeys.detail(matchId) });

      // Snapshot previous value
      const previousMatch = queryClient.getQueryData<Match>(matchKeys.detail(matchId));

      // Optimistically update
      if (previousMatch) {
        queryClient.setQueryData<Match>(matchKeys.detail(matchId), {
          ...previousMatch,
          // Update ready players optimistically
        });
      }

      return { previousMatch };
    },
    onSuccess: (updatedMatch) => {
      // Update match in cache with real data
      queryClient.setQueryData(matchKeys.detail(updatedMatch.id), updatedMatch);
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousMatch) {
        queryClient.setQueryData(matchKeys.detail(variables.matchId), context.previousMatch);
      }
      const message = error.response?.data?.message || 'Failed to update ready status.';
      toast.error(message);
    },
  });
};

/**
 * Hook to report match result
 */
export const useReportResult = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: ReportResultData }) =>
      reportResult(matchId, data),
    onSuccess: (updatedMatch) => {
      queryClient.setQueryData(matchKeys.detail(updatedMatch.id), updatedMatch);
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

      toast.success('Match result reported!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to report result.';
      toast.error(message);
    },
  });
};

/**
 * Hook to create a dispute
 */
export const useCreateDispute = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: CreateDisputeData }) =>
      createDispute(matchId, data),
    onSuccess: (updatedMatch) => {
      queryClient.setQueryData(matchKeys.detail(updatedMatch.id), updatedMatch);
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });

      toast.warning('Dispute created. Please submit evidence.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create dispute.';
      toast.error(message);
    },
  });
};

/**
 * Hook to submit dispute evidence
 */
export const useSubmitEvidence = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: SubmitEvidenceData }) =>
      submitEvidence(matchId, data),
    onSuccess: (updatedMatch) => {
      queryClient.setQueryData(matchKeys.detail(updatedMatch.id), updatedMatch);

      toast.success('Evidence submitted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to submit evidence.';
      toast.error(message);
    },
  });
};
