import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash, User } from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import { User as UserType } from '@shared/schema';

export default function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch users
  const { data: users, isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/users', { search: searchQuery }],
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/users/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف المستخدم بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
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

  const handleDeleteClick = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleEditClick = (user: UserType) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">{i18n.t('users')}</h2>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="relative flex-grow">
              <Input
                type="text"
                placeholder={i18n.t('search')}
                className="pr-10 bg-surface border-gray-700 text-white placeholder:text-gray-400"
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
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة مستخدم
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-surface text-white">
                <DialogHeader>
                  <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                </DialogHeader>
                <AddEditUserForm 
                  onSuccess={() => {
                    setIsAddDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="rounded-md border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-white">اسم المستخدم</TableHead>
                <TableHead className="text-white">الاسم المعروض</TableHead>
                <TableHead className="text-white">الدور</TableHead>
                <TableHead className="text-white">تاريخ الإنشاء</TableHead>
                <TableHead className="text-white w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ml-3">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-secondary bg-opacity-20 text-secondary' 
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {user.role === 'admin' ? 'مسؤول' : 'ضيف'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.role === 'admin'} // Prevent deleting admins
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
                    لا يوجد مستخدمين متطابقين مع البحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-surface text-white">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <AddEditUserForm 
              user={selectedUser}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['/api/users'] });
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
            هل أنت متأكد من رغبتك في حذف المستخدم "{selectedUser?.username}"؟
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

interface AddEditUserFormProps {
  user?: UserType;
  onSuccess: () => void;
}

function AddEditUserForm({ user, onSuccess }: AddEditUserFormProps) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    password: '', // Empty for editing
    role: user?.role || 'guest',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditing = !!user;

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // If editing and password is empty, remove it from the request
      const payload = isEditing && !formData.password 
        ? { ...data, password: undefined } 
        : data;
      
      if (isEditing) {
        return apiRequest('PATCH', `/api/users/${user.id}`, payload);
      } else {
        return apiRequest('POST', '/api/users', payload);
      }
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'تم التعديل بنجاح' : 'تمت الإضافة بنجاح',
        description: isEditing 
          ? 'تم تحديث بيانات المستخدم بنجاح' 
          : 'تمت إضافة المستخدم الجديد بنجاح',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.username || !formData.displayName || (!isEditing && !formData.password)) {
      toast({
        title: 'بيانات غير مكتملة',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-medium text-gray-200">اسم المستخدم</label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          disabled={isEditing} // Username cannot be changed when editing
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-medium text-gray-200">الاسم المعروض</label>
        <Input
          id="displayName"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-200">
          {isEditing ? 'كلمة المرور (اتركها فارغة للإبقاء على نفس كلمة المرور)' : 'كلمة المرور'}
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          required={!isEditing} // Required only for new users
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium text-gray-200">الدور</label>
        <Select
          value={formData.role}
          onValueChange={handleSelectChange}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="guest">ضيف</SelectItem>
            <SelectItem value="admin">مسؤول</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending} className="bg-secondary hover:bg-secondary-dark">
          {mutation.isPending ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة'}
        </Button>
      </DialogFooter>
    </form>
  );
}
