import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import i18n from '@/lib/i18n';

const formSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        navigate('/');
      } else {
        toast({
          title: i18n.t('loginFailure'),
          description: i18n.t('invalidCredentials'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: i18n.t('errorOccurred'),
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الدخول',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{i18n.t('loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{i18n.t('username')}</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-surface border-gray-700" 
                        placeholder={i18n.t('username')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{i18n.t('password')}</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-surface border-gray-700" 
                        type="password" 
                        placeholder={i18n.t('password')} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary-dark text-white" 
                disabled={isLoading}
              >
                {isLoading ? i18n.t('loading') : i18n.t('login')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
