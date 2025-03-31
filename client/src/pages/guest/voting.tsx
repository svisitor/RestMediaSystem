import { useQuery } from '@tanstack/react-query';
import GuestLayout from '@/components/layout/guest-layout';
import VotingForm from '@/components/voting-form';
import VotingList from '@/components/voting-list';
import i18n from '@/lib/i18n';

export default function Voting() {
  const { data: remainingSuggestions = 0 } = useQuery<number>({
    queryKey: ['/api/users/suggestions-count'],
  });

  return (
    <GuestLayout>
      <div className="px-4 md:px-8 py-8">
        <div className="bg-surface rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold mb-4">{i18n.t('contentVoting')}</h2>
          <p className="text-gray-300 mb-6">
            اقترح محتوى جديد أو صوت على اقتراحات الآخرين. يتم فرز التصويت يومياً في منتصف الليل.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Submission Form */}
            <div className="md:col-span-1">
              <VotingForm remainingSuggestions={remainingSuggestions} />
            </div>
            
            {/* Voting List */}
            <div className="md:col-span-2">
              <VotingList />
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
