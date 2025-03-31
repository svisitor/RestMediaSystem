import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import { insertVoteSuggestionSchema } from '@shared/schema';
import { Category } from '@shared/schema';

const formSchema = insertVoteSuggestionSchema.extend({
  categoryId: z.coerce.number().min(1, 'Category is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface VotingFormProps {
  remainingSuggestions: number;
}

export default function VotingForm({ remainingSuggestions }: VotingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: 'movie',
      categoryId: 0,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return apiRequest('POST', '/api/vote-suggestions', values);
    },
    onSuccess: () => {
      toast({
        title: i18n.t('submit'),
        description: 'تم إرسال اقتراحك بنجاح',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/vote-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/suggestions-count'] });
    },
    onError: (error) => {
      toast({
        title: i18n.t('errorOccurred'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate(values);
  };

  return (
    <div className="bg-background-light rounded-lg p-4">
      <h3 className="font-medium mb-3">{i18n.t('suggestNew')}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-400">{i18n.t('contentTitle')}</FormLabel>
                <FormControl>
                  <Input
                    className="w-full bg-surface p-2 rounded border border-gray-700 focus:outline-none focus:border-secondary"
                    placeholder={i18n.t('titlePlaceholder')}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-400">{i18n.t('type')}</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-surface p-2 rounded border border-gray-700 focus:outline-none focus:border-secondary">
                      <SelectValue placeholder={i18n.t('type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="movie">{i18n.t('movie')}</SelectItem>
                    <SelectItem value="series">{i18n.t('tvSeries')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-gray-400">{i18n.t('category')}</FormLabel>
                <Select
                  defaultValue={field.value.toString()}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-surface p-2 rounded border border-gray-700 focus:outline-none focus:border-secondary">
                      <SelectValue placeholder={i18n.t('category')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-secondary hover:bg-secondary-dark text-white py-2 rounded transition"
            disabled={submitMutation.isPending || remainingSuggestions <= 0}
          >
            {submitMutation.isPending ? i18n.t('loading') : i18n.t('submit')}
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            {i18n.t('remainingSuggestions', { count: remainingSuggestions })}
          </p>
        </form>
      </Form>
    </div>
  );
}
