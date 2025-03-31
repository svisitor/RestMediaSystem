import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import i18n from '@/lib/i18n';
import AppLayout from '@/components/layout/app-layout';
import { useToast } from '@/hooks/use-toast';
import { Category, insertCategorySchema } from '@shared/schema';
import { z } from 'zod';
import { DataStateWrapper } from '@/components/ui/data-states';

// Extend the insert schema with validation
const formSchema = insertCategorySchema.extend({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  type: z.string().min(1, {
    message: "Type is required.",
  }),
});

export default function Categories() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  
  const { data: categories, isLoading, isError } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Form setup
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'movie',
    },
  });
  
  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest('POST', '/api/categories', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: "Category has been created.",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category. " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof formSchema> }) => {
      const response = await apiRequest('PATCH', `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: "Category has been updated.",
      });
      setDialogOpen(false);
      setEditCategory(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category. " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({
        title: "Success",
        description: "Category has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category. " + error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editCategory) {
      updateMutation.mutate({ id: editCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Open dialog for editing
  const handleEdit = (category: Category) => {
    setEditCategory(category);
    form.reset({
      name: category.name,
      type: category.type,
    });
    setDialogOpen(true);
  };
  
  // Open dialog for creating
  const handleCreate = () => {
    setEditCategory(null);
    form.reset({
      name: '',
      type: 'movie',
    });
    setDialogOpen(true);
  };
  
  // Handle delete with confirmation
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AppLayout showLiveStreamBanner={false}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{i18n.t('categories')}</h1>
          <Button 
            onClick={handleCreate} 
            className="flex items-center"
          >
            <Plus className="h-5 w-5 ml-2" />
            <span>{i18n.t('addNew')}</span>
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{i18n.t('categories')}</CardTitle>
            <CardDescription>{i18n.t('manageCategories')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DataStateWrapper
              isLoading={isLoading}
              isError={isError}
              isEmpty={!categories || categories.length === 0}
              loadingMessage={i18n.t('loadingContent')}
              errorMessage={i18n.t('errorLoadingContent')}
              emptyMessage={i18n.t('noCategories')}
            >
              {categories && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{i18n.t('id')}</TableHead>
                        <TableHead>{i18n.t('name')}</TableHead>
                        <TableHead>{i18n.t('type')}</TableHead>
                        <TableHead className="text-right">{i18n.t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.id}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.type}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DataStateWrapper>
          </CardContent>
        </Card>
      </div>
      
      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editCategory ? i18n.t('editCategory') : i18n.t('createCategory')}
            </DialogTitle>
            <DialogDescription>
              {editCategory 
                ? i18n.t('editCategoryDescription') 
                : i18n.t('createCategoryDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{i18n.t('name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{i18n.t('type')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={i18n.t('selectType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="movie">{i18n.t('movie')}</SelectItem>
                        <SelectItem value="series">{i18n.t('tvSeries')}</SelectItem>
                        <SelectItem value="general">{i18n.t('general')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) 
                    ? i18n.t('loading') 
                    : editCategory 
                      ? i18n.t('update') 
                      : i18n.t('create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}