import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import { VoteSuggestionWithDetails } from '@/lib/types';
import { useAuth } from '@/lib/auth';

export default function VotingList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: voteSuggestions, isLoading } = useQuery<VoteSuggestionWithDetails[]>({
    queryKey: ['/api/vote-suggestions'],
  });

  const voteMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      return apiRequest('POST', `/api/vote-suggestions/${suggestionId}/vote`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vote-suggestions'] });
    },
    onError: (error) => {
      toast({
        title: i18n.t('errorOccurred'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleVote = (suggestionId: number) => {
    voteMutation.mutate(suggestionId);
  };

  if (isLoading) {
    return <div className="text-center py-4">{i18n.t('loading')}</div>;
  }

  if (!voteSuggestions || voteSuggestions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        لا توجد اقتراحات اليوم. كن أول من يقترح!
      </div>
    );
  }

  return (
    <div className="bg-background-light rounded-lg p-4">
      <h3 className="font-medium mb-3">{i18n.t('suggestedToday')}</h3>
      <div className="space-y-3">
        {voteSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-center justify-between bg-surface p-3 rounded"
          >
            <div>
              <h4 className="font-medium">{suggestion.title}</h4>
              <p className="text-sm text-gray-400">
                {i18n.t(suggestion.type === 'movie' ? 'movie' : 'tvSeries')} • 
                {suggestion.category?.name} • 
                {i18n.t('suggestedBy')} {suggestion.userDisplayName}
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold mr-2">{suggestion.votes}</span>
              <Button
                className="bg-accent hover:bg-accent-light text-white p-1 rounded transition"
                size="icon"
                onClick={() => handleVote(suggestion.id)}
                disabled={!user || voteMutation.isPending}
              >
                <ChevronUp className="h-6 w-6" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">{i18n.t('voteSortingTime')}</p>
        <p className="text-xs text-gray-500">{i18n.t('topSuggestionReview')}</p>
      </div>
    </div>
  );
}
