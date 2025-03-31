import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash, CalendarIcon, Clock } from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import { LiveStreamWithTimeRemaining } from '@/lib/types';

export default function AdminLiveStreams() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<LiveStreamWithTimeRemaining | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch live streams
  const { data: liveStreams, isLoading } = useQuery<LiveStreamWithTimeRemaining[]>({
    queryKey: ['/api/live-streams/all'],
  });

  // Delete live stream mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/live-streams/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف البث المباشر بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/live-streams'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'خطأ في الحذف',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditClick = (stream: LiveStreamWithTimeRemaining) => {
    setSelectedStream(stream);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (stream: LiveStreamWithTimeRemaining) => {
    setSelectedStream(stream);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedStream) {
      deleteMutation.mutate(selectedStream.id);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get stream status
  const getStreamStatus = (stream: LiveStreamWithTimeRemaining) => {
    const now = new Date();
    const startTime = new Date(stream.startTime);
    const endTime = new Date(stream.endTime);

    if (stream.isActive) {
      return { status: 'live', label: 'مباشر', className: 'bg-red-600 text-white' };
    } else if (now < startTime) {
      return { status: 'upcoming', label: 'قادم', className: 'bg-green-100 text-green-800' };
    } else if (now > endTime) {
      return { status: 'ended', label: 'منتهي', className: 'bg-gray-200 text-gray-800' };
    } else {
      return { status: 'scheduled', label: 'مجدول', className: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">إدارة البث المباشر</h2>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent-light text-white">
                <Plus className="h-5 w-5 ml-2" />
                إضافة بث جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-surface text-white">
              <DialogHeader>
                <DialogTitle>إضافة بث مباشر جديد</DialogTitle>
              </DialogHeader>
              <AddEditLiveStreamForm 
                onSuccess={() => {
                  setIsAddDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/live-streams'] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white">العنوان</TableHead>
                <TableHead className="text-white">التصنيف</TableHead>
                <TableHead className="text-white">التاريخ</TableHead>
                <TableHead className="text-white">الوقت</TableHead>
                <TableHead className="text-white">الحالة</TableHead>
                <TableHead className="text-white w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : liveStreams && liveStreams.length > 0 ? (
                liveStreams.map((stream) => {
                  const streamStatus = getStreamStatus(stream);
                  
                  return (
                    <TableRow key={stream.id}>
                      <TableCell className="font-medium">{stream.title}</TableCell>
                      <TableCell>{stream.category}</TableCell>
                      <TableCell>{formatDate(stream.startTime)}</TableCell>
                      <TableCell>
                        {formatTime(stream.startTime)} - {formatTime(stream.endTime)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${streamStatus.className}`}>
                          {streamStatus.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2 space-x-reverse">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-white"
                            onClick={() => handleEditClick(stream)}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteClick(stream)}
                          >
                            <Trash className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                    لا توجد عمليات بث مباشر متاحة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-surface text-white">
          <DialogHeader>
            <DialogTitle>تعديل البث المباشر</DialogTitle>
          </DialogHeader>
          {selectedStream && (
            <AddEditLiveStreamForm 
              stream={selectedStream}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/live-streams'] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-surface text-white">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            هل أنت متأكد من رغبتك في حذف "{selectedStream?.title}"؟
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete} 
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

interface AddEditLiveStreamFormProps {
  stream?: LiveStreamWithTimeRemaining;
  onSuccess: () => void;
}

function AddEditLiveStreamForm({ stream, onSuccess }: AddEditLiveStreamFormProps) {
  // Convert dates to local ISO string format for input fields
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Convert to YYYY-MM-DDThh:mm format for datetime-local input
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16);
  };
  
  const [formData, setFormData] = useState({
    title: stream?.title || '',
    description: stream?.description || '',
    category: stream?.category || '',
    streamUrl: stream?.streamUrl || '',
    startTime: formatDateForInput(stream?.startTime),
    endTime: formatDateForInput(stream?.endTime),
    isActive: stream?.isActive || false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = !!stream;

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing) {
        return apiRequest('PATCH', `/api/live-streams/${stream.id}`, data);
      } else {
        return apiRequest('POST', '/api/live-streams', data);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        description: isEditing 
          ? 'تم تحديث البث المباشر بنجاح' 
          : 'تمت إضافة البث المباشر الجديد بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/live-streams'] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (endTime <= startTime) {
      toast({
        title: 'خطأ في التواريخ',
        description: 'يجب أن يكون وقت الانتهاء بعد وقت البدء',
        variant: 'destructive',
      });
      return;
    }
    
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-200">العنوان</label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-200">الوصف</label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 h-20"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-gray-200">التصنيف</label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="streamUrl" className="text-sm font-medium text-gray-200">رابط البث</label>
          <Input
            id="streamUrl"
            name="streamUrl"
            value={formData.streamUrl}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="startTime" className="text-sm font-medium text-gray-200 flex items-center">
            <CalendarIcon className="h-4 w-4 ml-1" />
            وقت البدء
          </label>
          <Input
            id="startTime"
            name="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="endTime" className="text-sm font-medium text-gray-200 flex items-center">
            <Clock className="h-4 w-4 ml-1" />
            وقت الانتهاء
          </label>
          <Input
            id="endTime"
            name="endTime"
            type="datetime-local"
            value={formData.endTime}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="rounded border-gray-400 text-secondary focus:ring-secondary"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-200">
          نشط (البث المباشر يعمل حالياً)
        </label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending} className="bg-accent hover:bg-accent-light">
          {mutation.isPending ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة'}
        </Button>
      </DialogFooter>
    </form>
  );
}
