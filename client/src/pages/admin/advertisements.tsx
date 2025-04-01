import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Trash2, PlusCircle, Edit, Eye } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAdvertisementSchema, Advertisement } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";

export default function AdvertisementsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  const { data: advertisements, isLoading } = useQuery<Advertisement[]>({
    queryKey: ['/api/advertisements'],
  });

  // Extend the schema to handle string dates that will be converted to ISO strings
  const formSchema = insertAdvertisementSchema.extend({
    startDate: z.string(),
    endDate: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const addForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      startDate: new Date().toISOString().substring(0, 10),
      isActive: true,
      priority: 5
    }
  });
  
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      linkUrl: "",
      startDate: "",
      isActive: true,
      priority: 5
    }
  });

  const addMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Convert string dates to ISO format
      const data = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        endDate: values.endDate ? new Date(values.endDate).toISOString() : undefined
      };
      return apiRequest('POST', '/api/advertisements', data);
    },
    onSuccess: () => {
      toast({
        title: "نجاح",
        description: "تمت إضافة الإعلان بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements/active'] });
      setIsAddDialogOpen(false);
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الإعلان",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  const editMutation = useMutation({
    mutationFn: async (values: FormValues & { id: number }) => {
      const { id, ...rest } = values;
      // Convert string dates to ISO format
      const data = {
        ...rest,
        startDate: rest.startDate ? new Date(rest.startDate).toISOString() : undefined,
        endDate: rest.endDate ? new Date(rest.endDate).toISOString() : undefined
      };
      return apiRequest('PATCH', `/api/advertisements/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "نجاح",
        description: "تم تحديث الإعلان بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements/active'] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الإعلان",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/advertisements/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "نجاح",
        description: "تم حذف الإعلان بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisements/active'] });
      setIsDeleteDialogOpen(false);
      setSelectedAd(null);
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الإعلان",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  const onAddSubmit = (data: FormValues) => {
    addMutation.mutate(data);
  };

  const onEditSubmit = (data: FormValues) => {
    if (!selectedAd) return;
    editMutation.mutate({ ...data, id: selectedAd.id });
  };

  const handleEditClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    editForm.reset({
      title: ad.title,
      description: ad.description || "",
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || "",
      startDate: new Date(ad.startDate).toISOString().substring(0, 10),
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().substring(0, 10) : undefined,
      isActive: ad.isActive,
      priority: ad.priority
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsDeleteDialogOpen(true);
  };

  const handlePreviewClick = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsPreviewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <AdminLayout>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>إدارة الإعلانات</CardTitle>
          <CardDescription>
            عرض وإضافة وتعديل وحذف الإعلانات والعروض الخاصة في الاستراحة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>إضافة إعلان جديد</span>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <p>جاري التحميل...</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ البدء</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advertisements && advertisements.length > 0 ? (
                    advertisements.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            ad.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {ad.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(ad.startDate)}</TableCell>
                        <TableCell>{ad.endDate ? formatDate(ad.endDate) : 'غير محدد'}</TableCell>
                        <TableCell>{ad.priority}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePreviewClick(ad)}
                              title="معاينة"
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(ad)}
                              title="تعديل"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(ad)}
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        لا توجد إعلانات حالياً
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Advertisement Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة إعلان جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الإعلان الجديد أدناه
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان الإعلان" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea placeholder="وصف الإعلان" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        رابط صورة للإعلان، يفضل المقاس 16:9
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الإعلان</FormLabel>
                      <FormControl>
                        <Input placeholder="/specials/food" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        الرابط الذي سينتقل إليه المستخدم عند النقر على الإعلان
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ البدء</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الانتهاء (اختياري)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)} 
                        />
                      </FormControl>
                      <FormDescription>
                        اتركه فارغاً إذا كان الإعلان بدون تاريخ انتهاء
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الأولوية</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10" 
                          {...field} 
                          value={field.value || 5}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        من 1 (الأقل) إلى 10 (الأعلى)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>نشط</FormLabel>
                        <FormDescription>
                          هل هذا الإعلان متاح للعرض؟
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? "جاري الإضافة..." : "إضافة الإعلان"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Advertisement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الإعلان</DialogTitle>
            <DialogDescription>
              تعديل تفاصيل الإعلان
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان الإعلان" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea placeholder="وصف الإعلان" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الصورة</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        رابط صورة للإعلان
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابط الإعلان</FormLabel>
                      <FormControl>
                        <Input placeholder="/specials/food" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>
                        الرابط الذي سينتقل إليه المستخدم عند النقر على الإعلان
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ البدء</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الانتهاء (اختياري)</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)} 
                        />
                      </FormControl>
                      <FormDescription>
                        اتركه فارغاً إذا كان الإعلان بدون تاريخ انتهاء
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الأولوية</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10" 
                          {...field} 
                          value={field.value || 5}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        من 1 (الأقل) إلى 10 (الأعلى)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>نشط</FormLabel>
                        <FormDescription>
                          هل هذا الإعلان متاح للعرض؟
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={editMutation.isPending}
                >
                  {editMutation.isPending ? "جاري التحديث..." : "تحديث الإعلان"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Advertisement Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الإعلان</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAd && (
            <div className="py-4">
              <p className="font-semibold">{selectedAd.title}</p>
              {selectedAd.description && (
                <p className="text-sm text-gray-500 mt-1">{selectedAd.description}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => selectedAd && deleteMutation.mutate(selectedAd.id)}
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف الإعلان"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Advertisement Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>معاينة الإعلان</DialogTitle>
          </DialogHeader>
          
          {selectedAd && (
            <div className="overflow-hidden rounded-lg">
              <div className="relative">
                <img 
                  src={selectedAd.imageUrl}
                  alt={selectedAd.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white">{selectedAd.title}</h3>
                  {selectedAd.description && (
                    <p className="text-white/90 mt-2">{selectedAd.description}</p>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">الرابط: </span>
                    <span className="text-blue-600">{selectedAd.linkUrl}</span>
                  </div>
                  <div>
                    <span className="font-medium">الحالة: </span>
                    <span className={selectedAd.isActive ? "text-green-600" : "text-gray-600"}>
                      {selectedAd.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">تاريخ البدء: </span>
                    <span>{formatDate(selectedAd.startDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium">تاريخ الانتهاء: </span>
                    <span>{selectedAd.endDate ? formatDate(selectedAd.endDate) : "غير محدد"}</span>
                  </div>
                  <div>
                    <span className="font-medium">الأولوية: </span>
                    <span>{selectedAd.priority}/10</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}