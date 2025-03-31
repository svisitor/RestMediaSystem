import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X, ThumbsUp, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import { VoteSuggestionWithDetails } from '@/lib/types';

export default function AdminVoting() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<VoteSuggestionWithDetails | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch vote suggestions
  const { data: voteSuggestions, isLoading } = useQuery<VoteSuggestionWithDetails[]>({
    queryKey: ['/api/admin/vote-suggestions'],
  });

  // Approve suggestion mutation
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/vote-suggestions/${id}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: 'تمت الموافقة بنجاح',
        description: 'تم قبول الاقتراح وسيتم إضافته للمحتوى',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vote-suggestions'] });
      setIsApproveDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'خطأ في الموافقة',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject suggestion mutation
  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('POST', `/api/vote-suggestions/${id}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: 'تم الرفض بنجاح',
        description: 'تم رفض الاقتراح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vote-suggestions'] });
      setIsRejectDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'خطأ في الرفض',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleApproveClick = (suggestion: VoteSuggestionWithDetails) => {
    setSelectedSuggestion(suggestion);
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = (suggestion: VoteSuggestionWithDetails) => {
    setSelectedSuggestion(suggestion);
    setIsRejectDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedSuggestion) {
      approveMutation.mutate(selectedSuggestion.id);
    }
  };

  const confirmReject = () => {
    if (selectedSuggestion) {
      rejectMutation.mutate(selectedSuggestion.id);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      default:
        return <Badge className="bg-gray-500">غير معروف</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">إدارة التصويت</h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        ) : voteSuggestions && voteSuggestions.length > 0 ? (
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-white">العنوان</TableHead>
                  <TableHead className="text-white">النوع</TableHead>
                  <TableHead className="text-white">التصنيف</TableHead>
                  <TableHead className="text-white">المقترح</TableHead>
                  <TableHead className="text-white">تاريخ الاقتراح</TableHead>
                  <TableHead className="text-white">الأصوات</TableHead>
                  <TableHead className="text-white">الحالة</TableHead>
                  <TableHead className="text-white w-[120px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {voteSuggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell className="font-medium">{suggestion.title}</TableCell>
                    <TableCell>
                      {suggestion.type === 'movie' ? 'فيلم' : 'مسلسل'}
                    </TableCell>
                    <TableCell>{suggestion.category?.name || '-'}</TableCell>
                    <TableCell>{suggestion.userDisplayName || '-'}</TableCell>
                    <TableCell>{formatDate(suggestion.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 ml-1 text-accent" />
                        <span>{suggestion.votes}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                    <TableCell>
                      {suggestion.status === 'pending' && (
                        <div className="flex space-x-2 space-x-reverse">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-green-500"
                            onClick={() => handleApproveClick(suggestion)}
                          >
                            <Check className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleRejectClick(suggestion)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-surface rounded-lg p-10 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">لا توجد اقتراحات</h3>
            <p className="text-gray-400">
              لا توجد اقتراحات تصويت للمراجعة حالياً
            </p>
          </div>
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-surface text-white">
          <DialogHeader>
            <DialogTitle>تأكيد الموافقة</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">
              هل أنت متأكد من رغبتك في الموافقة على اقتراح "{selectedSuggestion?.title}"؟
            </p>
            <p className="text-sm text-gray-400">
              سيتم إضافة هذا المحتوى إلى قائمة المحتوى المطلوب تضمينه
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmApprove} 
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'جاري المعالجة...' : 'موافقة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-surface text-white">
          <DialogHeader>
            <DialogTitle>تأكيد الرفض</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">
              هل أنت متأكد من رغبتك في رفض اقتراح "{selectedSuggestion?.title}"؟
            </p>
            <p className="text-sm text-gray-400">
              سيتم إزالة هذا الاقتراح من قائمة الاقتراحات النشطة
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject} 
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'جاري المعالجة...' : 'رفض'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
