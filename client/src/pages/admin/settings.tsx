import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, RefreshCw, Database, Key, Shield, Globe, Moon, Sun } from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { apiRequest } from '@/lib/queryClient';

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'استراحة مانجر',
    siteDescription: 'نظام إدارة المحتوى الترفيهي للاستراحات والفنادق',
    maxDailyVotes: 10,
    darkMode: true,
    allowDownloads: true,
    autoProcessVoting: true,
  });

  // Network settings
  const [networkSettings, setNetworkSettings] = useState({
    localNetworkOnly: true,
    requireAuthentication: true,
    streamingQuality: 'hd',
  });

  // Database settings
  const [databaseSettings, setDatabaseSettings] = useState({
    backupFrequency: 'daily',
    backupTime: '00:00',
    backupRetention: 7,
  });

  // Save general settings mutation
  const generalSettingsMutation = useMutation({
    mutationFn: async (data: typeof generalSettings) => {
      return apiRequest('POST', '/api/admin/settings/general', data);
    },
    onSuccess: () => {
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات العامة بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Save network settings mutation
  const networkSettingsMutation = useMutation({
    mutationFn: async (data: typeof networkSettings) => {
      return apiRequest('POST', '/api/admin/settings/network', data);
    },
    onSuccess: () => {
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات الشبكة بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Save database settings mutation
  const databaseSettingsMutation = useMutation({
    mutationFn: async (data: typeof databaseSettings) => {
      return apiRequest('POST', '/api/admin/settings/database', data);
    },
    onSuccess: () => {
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات قاعدة البيانات بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Manual backup mutation
  const manualBackupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/backup', {});
    },
    onSuccess: () => {
      toast({
        title: 'تم النسخ الاحتياطي',
        description: 'تم إنشاء نسخة احتياطية من قاعدة البيانات بنجاح',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ في النسخ الاحتياطي',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleGeneralSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseInt(value) 
          : value
    }));
  };

  const handleNetworkSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    setNetworkSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };

  const handleDatabaseSettingsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDatabaseSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean, settingsType: string) => {
    if (settingsType === 'general') {
      setGeneralSettings(prev => ({ ...prev, [name]: checked }));
    } else if (settingsType === 'network') {
      setNetworkSettings(prev => ({ ...prev, [name]: checked }));
    }
  };

  const handleSaveSettings = () => {
    switch (activeTab) {
      case 'general':
        generalSettingsMutation.mutate(generalSettings);
        break;
      case 'network':
        networkSettingsMutation.mutate(networkSettings);
        break;
      case 'database':
        databaseSettingsMutation.mutate(databaseSettings);
        break;
    }
  };

  const handleManualBackup = () => {
    manualBackupMutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">الإعدادات</h2>
          
          <Button 
            onClick={handleSaveSettings} 
            className="bg-secondary hover:bg-secondary-dark text-white"
            disabled={
              generalSettingsMutation.isPending || 
              networkSettingsMutation.isPending || 
              databaseSettingsMutation.isPending
            }
          >
            <Save className="h-5 w-5 ml-2" />
            حفظ الإعدادات
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              إعدادات عامة
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              إعدادات الشبكة
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-1">
              <Database className="h-4 w-4" />
              قاعدة البيانات
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="bg-surface border-gray-700">
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>إعدادات عامة للنظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">اسم الموقع</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={generalSettings.siteName}
                      onChange={handleGeneralSettingsChange}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDailyVotes">الحد الأقصى للاقتراحات اليومية</Label>
                    <Input
                      id="maxDailyVotes"
                      name="maxDailyVotes"
                      type="number"
                      value={generalSettings.maxDailyVotes.toString()}
                      onChange={handleGeneralSettingsChange}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">وصف الموقع</Label>
                  <Textarea
                    id="siteDescription"
                    name="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralSettingsChange}
                    className="bg-gray-800 border-gray-700 h-20"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode" className="text-base">الوضع الداكن</Label>
                      <p className="text-sm text-gray-400">
                        تفعيل الوضع الداكن افتراضياً
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 ml-2 text-gray-400" />
                      <Switch
                        id="darkMode"
                        checked={generalSettings.darkMode}
                        onCheckedChange={(checked) => handleSwitchChange('darkMode', checked, 'general')}
                      />
                      <Moon className="h-4 w-4 mr-2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowDownloads" className="text-base">السماح بالتحميل</Label>
                      <p className="text-sm text-gray-400">
                        السماح للمستخدمين بتحميل المحتوى
                      </p>
                    </div>
                    <Switch
                      id="allowDownloads"
                      checked={generalSettings.allowDownloads}
                      onCheckedChange={(checked) => handleSwitchChange('allowDownloads', checked, 'general')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoProcessVoting" className="text-base">معالجة التصويت تلقائياً</Label>
                      <p className="text-sm text-gray-400">
                        معالجة نتائج التصويت تلقائياً عند منتصف الليل
                      </p>
                    </div>
                    <Switch
                      id="autoProcessVoting"
                      checked={generalSettings.autoProcessVoting}
                      onCheckedChange={(checked) => handleSwitchChange('autoProcessVoting', checked, 'general')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="network">
            <Card className="bg-surface border-gray-700">
              <CardHeader>
                <CardTitle>إعدادات الشبكة والأمان</CardTitle>
                <CardDescription>إعدادات الشبكة والأمان للنظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="localNetworkOnly" className="text-base">الشبكة المحلية فقط</Label>
                      <p className="text-sm text-gray-400">
                        حصر الوصول على الشبكة المحلية فقط
                      </p>
                    </div>
                    <Switch
                      id="localNetworkOnly"
                      checked={networkSettings.localNetworkOnly}
                      onCheckedChange={(checked) => handleSwitchChange('localNetworkOnly', checked, 'network')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireAuthentication" className="text-base">تسجيل الدخول مطلوب</Label>
                      <p className="text-sm text-gray-400">
                        تتطلب من المستخدمين تسجيل الدخول للوصول إلى المحتوى
                      </p>
                    </div>
                    <Switch
                      id="requireAuthentication"
                      checked={networkSettings.requireAuthentication}
                      onCheckedChange={(checked) => handleSwitchChange('requireAuthentication', checked, 'network')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="streamingQuality">جودة البث</Label>
                  <select
                    id="streamingQuality"
                    name="streamingQuality"
                    value={networkSettings.streamingQuality}
                    onChange={handleNetworkSettingsChange}
                    className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                  >
                    <option value="sd">جودة عادية (SD)</option>
                    <option value="hd">جودة عالية (HD)</option>
                    <option value="4k">جودة فائقة (4K)</option>
                  </select>
                </div>
                
                <div className="p-4 bg-yellow-900 bg-opacity-20 rounded-md border border-yellow-800">
                  <div className="flex items-start">
                    <Key className="h-5 w-5 text-yellow-500 mt-0.5 ml-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-500 font-medium mb-1">ملاحظة هامة حول الأمان</h4>
                      <p className="text-sm text-yellow-200">
                        تأكد من تكوين إعدادات الشبكة بشكل صحيح لمنع الوصول غير المصرح به إلى المحتوى.
                        يوصى بتفعيل خيار الشبكة المحلية فقط وتسجيل الدخول المطلوب.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="database">
            <Card className="bg-surface border-gray-700">
              <CardHeader>
                <CardTitle>قاعدة البيانات والنسخ الاحتياطي</CardTitle>
                <CardDescription>إعدادات قاعدة البيانات والنسخ الاحتياطي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
                    <select
                      id="backupFrequency"
                      name="backupFrequency"
                      value={databaseSettings.backupFrequency}
                      onChange={handleDatabaseSettingsChange}
                      className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                    >
                      <option value="daily">يومي</option>
                      <option value="weekly">أسبوعي</option>
                      <option value="monthly">شهري</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupTime">وقت النسخ الاحتياطي</Label>
                    <Input
                      id="backupTime"
                      name="backupTime"
                      type="time"
                      value={databaseSettings.backupTime}
                      onChange={handleDatabaseSettingsChange}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupRetention">مدة الاحتفاظ (أيام)</Label>
                    <Input
                      id="backupRetention"
                      name="backupRetention"
                      type="number"
                      value={databaseSettings.backupRetention.toString()}
                      onChange={handleDatabaseSettingsChange}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <Button 
                    onClick={handleManualBackup} 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={manualBackupMutation.isPending}
                  >
                    <RefreshCw className={`h-5 w-5 ml-2 ${manualBackupMutation.isPending ? 'animate-spin' : ''}`} />
                    {manualBackupMutation.isPending ? 'جاري النسخ الاحتياطي...' : 'إنشاء نسخة احتياطية يدوياً'}
                  </Button>
                </div>
                
                <div className="p-4 bg-blue-900 bg-opacity-20 rounded-md border border-blue-800">
                  <div className="flex items-start">
                    <Database className="h-5 w-5 text-blue-500 mt-0.5 ml-2 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-500 font-medium mb-1">معلومات قاعدة البيانات</h4>
                      <p className="text-sm text-blue-200">
                        يتم حفظ جميع البيانات في قاعدة بيانات PostgreSQL.
                        تأكد من إعداد النسخ الاحتياطي بانتظام للحفاظ على بياناتك آمنة.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-700 flex justify-between">
                <div className="text-xs text-gray-400">
                  آخر نسخة احتياطية: لم يتم إجراء نسخة احتياطية بعد
                </div>
                <div className="text-xs text-gray-400">
                  حجم قاعدة البيانات: غير معروف
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
