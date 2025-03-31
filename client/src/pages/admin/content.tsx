import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash, Film } from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import { MediaWithDetails, SeriesWithDetails } from '@/lib/types';
import { Category } from '@shared/schema';

export default function Content() {
  const [selectedTab, setSelectedTab] = useState('movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaWithDetails | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch media data
  const { data: movies, isLoading: isLoadingMovies } = useQuery<MediaWithDetails[]>({
    queryKey: ['/api/media', { type: 'movie', search: searchQuery }],
  });

  const { data: series, isLoading: isLoadingSeries } = useQuery<SeriesWithDetails[]>({
    queryKey: ['/api/media', { type: 'series', search: searchQuery }],
  });

  // Fetch categories for form
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/media/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف المحتوى بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch due to the queryKey change
  };

  const handleDeleteClick = (media: MediaWithDetails) => {
    setSelectedMedia(media);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (media: MediaWithDetails) => {
    setSelectedMedia(media);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMedia) {
      deleteMutation.mutate(selectedMedia.id);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">{i18n.t('content')}</h2>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="relative flex-grow">
              <Input
                type="text"
                placeholder={i18n.t('search')}
                className="pr-10 bg-surface border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary-dark text-white">
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة محتوى
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-surface text-white">
                <DialogHeader>
                  <DialogTitle>إضافة محتوى جديد</DialogTitle>
                </DialogHeader>
                <AddEditMediaForm 
                  onSuccess={() => {
                    setIsAddDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['/api/media'] });
                  }}
                  categories={categories || []}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="movies" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="movies">أفلام</TabsTrigger>
            <TabsTrigger value="series">مسلسلات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="movies">
            <div className="rounded-md border border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-white">العنوان</TableHead>
                    <TableHead className="text-white">التصنيف</TableHead>
                    <TableHead className="text-white">السنة</TableHead>
                    <TableHead className="text-white">تاريخ الإضافة</TableHead>
                    <TableHead className="text-white w-[100px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingMovies ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : movies && movies.length > 0 ? (
                    movies.map((movie) => (
                      <TableRow key={movie.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center ml-3">
                              <Film className="h-5 w-5 text-gray-400" />
                            </div>
                            {movie.title}
                          </div>
                        </TableCell>
                        <TableCell>{movie.category?.name || '-'}</TableCell>
                        <TableCell>{movie.year}</TableCell>
                        <TableCell>
                          {new Date(movie.createdAt).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => handleEditClick(movie)}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => handleDeleteClick(movie)}
                            >
                              <Trash className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                        لا توجد أفلام متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="series">
            <div className="rounded-md border border-gray-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-white">العنوان</TableHead>
                    <TableHead className="text-white">التصنيف</TableHead>
                    <TableHead className="text-white">المواسم</TableHead>
                    <TableHead className="text-white">السنة</TableHead>
                    <TableHead className="text-white">تاريخ الإضافة</TableHead>
                    <TableHead className="text-white w-[100px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSeries ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : series && series.length > 0 ? (
                    series.map((seriesItem) => (
                      <TableRow key={seriesItem.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center ml-3">
                              <Film className="h-5 w-5 text-gray-400" />
                            </div>
                            {seriesItem.title}
                          </div>
                        </TableCell>
                        <TableCell>{seriesItem.category?.name || '-'}</TableCell>
                        <TableCell>{seriesItem.seasons?.length || 0}</TableCell>
                        <TableCell>{seriesItem.year}</TableCell>
                        <TableCell>
                          {new Date(seriesItem.createdAt).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2 space-x-reverse">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => handleEditClick(seriesItem)}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-gray-400 hover:text-red-500"
                              onClick={() => handleDeleteClick(seriesItem)}
                            >
                              <Trash className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                        لا توجد مسلسلات متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-surface text-white">
          <DialogHeader>
            <DialogTitle>تعديل المحتوى</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <AddEditMediaForm 
              media={selectedMedia}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/media'] });
              }}
              categories={categories || []}
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
            هل أنت متأكد من رغبتك في حذف "{selectedMedia?.title}"؟
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

interface AddEditMediaFormProps {
  media?: MediaWithDetails;
  onSuccess: () => void;
  categories: Category[];
}

function AddEditMediaForm({ media, onSuccess, categories }: AddEditMediaFormProps) {
  const [formData, setFormData] = useState({
    title: media?.title || '',
    description: media?.description || '',
    type: media?.type || 'movie',
    categoryId: media?.categoryId || 0,
    thumbnailUrl: media?.thumbnailUrl || '',
    filePath: media?.filePath || '',
    year: media?.year || new Date().getFullYear(),
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = !!media;

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (isEditing) {
        return apiRequest('PATCH', `/api/media/${media.id}`, data);
      } else {
        return apiRequest('POST', '/api/media', data);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        description: isEditing 
          ? 'تم تحديث المحتوى بنجاح' 
          : 'تمت إضافة المحتوى الجديد بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: name === 'categoryId' ? parseInt(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <label htmlFor="year" className="text-sm font-medium text-gray-200">السنة</label>
          <Input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-gray-200">النوع</label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleSelectChange('type', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="movie">فيلم</SelectItem>
              <SelectItem value="series">مسلسل</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="categoryId" className="text-sm font-medium text-gray-200">التصنيف</label>
          <Select
            value={formData.categoryId.toString()}
            onValueChange={(value) => handleSelectChange('categoryId', value)}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <label htmlFor="thumbnailUrl" className="text-sm font-medium text-gray-200">رابط الصورة المصغرة</label>
          <Input
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="filePath" className="text-sm font-medium text-gray-200">مسار الملف</label>
          <Input
            id="filePath"
            name="filePath"
            value={formData.filePath}
            onChange={handleChange}
            className="bg-gray-800 border-gray-700"
            required
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending} className="bg-secondary hover:bg-secondary-dark">
          {mutation.isPending ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة'}
        </Button>
      </DialogFooter>
    </form>
  );
}
