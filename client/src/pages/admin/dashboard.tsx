import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Edit, Trash, Edit3, Clock, Film, Users, Tag, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/app-layout';
import i18n from '@/lib/i18n';
import { AdminStats, MediaWithDetails, VoteSuggestionWithDetails, LiveStreamWithTimeRemaining } from '@/lib/types';

export default function Dashboard() {
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: recentContent } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/admin/recent-content'],
  });

  const { data: topVotedContent } = useQuery<VoteSuggestionWithDetails[]>({
    queryKey: ['/api/admin/top-voted'],
  });

  const { data: upcomingStreams } = useQuery<LiveStreamWithTimeRemaining[]>({
    queryKey: ['/api/live-streams/upcoming', { limit: 1 }],
  });

  return (
    <AppLayout showLiveStreamBanner={false}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">{i18n.t('overview')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-surface">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-600 bg-opacity-25 text-blue-500 ml-4">
                  <Film className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">{i18n.t('totalContent')}</div>
                  <div className="text-2xl font-bold">{stats?.totalContent || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-surface">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-600 bg-opacity-25 text-green-500 ml-4">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">{i18n.t('activeUsers')}</div>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-surface">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-600 bg-opacity-25 text-yellow-500 ml-4">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">{i18n.t('todaySuggestions')}</div>
                  <div className="text-2xl font-bold">{stats?.todaySuggestions || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-surface">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-600 bg-opacity-25 text-red-500 ml-4">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-gray-400 text-sm">{i18n.t('upcomingBroadcast')}</div>
                  <div className="text-2xl font-bold">{stats?.upcomingBroadcasts || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Recent Uploads & Voting Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Uploads */}
        <Card className="bg-surface lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{i18n.t('latestContent')}</h3>
              <Link to="/admin/content">
                <a className="text-secondary hover:text-secondary-light text-sm">
                  {i18n.t('viewAll')}
                </a>
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentContent ? (
                recentContent.map((item) => (
                  <div key={item.id} className="flex items-center p-2 hover:bg-surface-light rounded">
                    <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center ml-3">
                      <Film className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-400">
                        {item.type === 'movie' ? i18n.t('movie') : i18n.t('tvSeries')} • 
                        {item.category?.name} • 
                        {i18n.t('addedAgo')} 2 {i18n.t('hours')}
                      </p>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                        <Trash className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400">
                  {i18n.t('loading')}
                </div>
              )}
              
              {recentContent && recentContent.length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  لا يوجد محتوى مضاف حديثاً
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Voted Content */}
        <Card className="bg-surface">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{i18n.t('topVoted')}</h3>
              {topVotedContent && topVotedContent.length > 0 && (
                <span className="bg-accent text-white text-xs py-1 px-2 rounded">{i18n.t('reviewStatus')}</span>
              )}
            </div>
            
            {topVotedContent && topVotedContent.length > 0 ? (
              <>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-bold text-lg mb-2">{topVotedContent[0].title}</h4>
                  <p className="text-gray-300 mb-2">
                    {topVotedContent[0].type === 'movie' ? i18n.t('movie') : i18n.t('tvSeries')} • 
                    {topVotedContent[0].category?.name}
                  </p>
                  <div className="flex items-center mb-4">
                    <div className="p-1 rounded-full bg-accent bg-opacity-25 text-accent ml-2">
                      <Edit3 className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-accent">
                      {topVotedContent[0].votes} {i18n.t('votes')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="default" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      {i18n.t('accept')}
                    </Button>
                    <Button variant="default" className="w-full bg-red-600 hover:bg-red-700 text-white">
                      {i18n.t('reject')}
                    </Button>
                  </div>
                </div>
                
                {topVotedContent.length > 1 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-400 mb-2">{i18n.t('otherSuggestions')}</h4>
                    <div className="space-y-2">
                      {topVotedContent.slice(1).map((suggestion) => (
                        <div key={suggestion.id} className="flex justify-between items-center p-2 hover:bg-surface-light rounded">
                          <div>
                            <h5 className="font-medium">{suggestion.title}</h5>
                            <p className="text-xs text-gray-400">
                              {suggestion.type === 'movie' ? i18n.t('movie') : i18n.t('tvSeries')} • 
                              {suggestion.votes} {i18n.t('votes')}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                            <Edit className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 px-4">
                <AlertCircle className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">لا توجد اقتراحات بعد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Live Broadcast Management */}
      <Card className="bg-surface mb-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{i18n.t('broadcastManagement')}</h3>
            <Link to="/admin/live-streams">
              <Button variant="default" size="sm" className="bg-accent hover:bg-accent-light text-white">
                {i18n.t('addNewBroadcast')}
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {i18n.t('title')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {i18n.t('date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {i18n.t('time')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {i18n.t('status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {i18n.t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {upcomingStreams && upcomingStreams.length > 0 ? (
                  upcomingStreams.map((stream) => {
                    const startDate = new Date(stream.startTime);
                    const formattedDate = startDate.toLocaleDateString('ar-SA');
                    const formattedTime = startDate.toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    
                    return (
                      <tr key={stream.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{stream.title}</div>
                          <div className="text-gray-400 text-sm">{stream.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formattedDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formattedTime}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {i18n.t('upcoming')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex space-x-2 space-x-reverse">
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                              <Trash className="h-5 w-5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                      لا توجد بث مباشر مجدول
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
