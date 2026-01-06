import { useState, type MouseEvent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Sparkles, RefreshCcw, Loader2 } from 'lucide-react';
import DocumentsManager from '@/features/chatbot/DocumentsManager';
import PromptingManager from '@/features/chatbot/PromptingManager';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useToast } from '@/hooks/use-toast';
import chatbotDatasetService from '@/features/chatbot/chatbotDatasetService';

export default function ChatbotDatasetPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const user = JSON.parse(localStorage.getItem('ptit_user') || 'null');
  const { toast } = useToast();

  const handleDataUpdate = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSyncDataset = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncProgress(10);

    let current = 10;
    const intervalId = window.setInterval(() => {
      current = Math.min(current + 5, 90);
      setSyncProgress(current);
    }, 400);

    try {
      const response = await chatbotDatasetService.syncDataset();
      setSyncProgress(100);
      toast({
        title: 'Đồng bộ thành công',
        description:
          response.message || 'Dataset chatbot đã được đồng bộ thành công.',
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: 'Đồng bộ thất bại',
        description:
          err instanceof Error
            ? err.message
            : 'Không thể đồng bộ dataset chatbot.',
        variant: 'destructive',
      });
    } finally {
      window.clearInterval(intervalId);
      setTimeout(() => setSyncProgress(0), 500);
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar roles={user?.roles} />
        <main className="flex-1 p-4 md:p-8 lg:p-10 ml-0 md:ml-72 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl sm:text-4xl font-semibold sm:font-bold text-slate-900 tracking-tight">
                Quản lý Documents và Prompting cho hệ thống chatbot
              </h1>
              {/* <p className="text-base sm:text-lg text-slate-600 max-w-2xl">
                Quản lý Documents và Prompting cho hệ thống chatbot
              </p> */}
            </div>

            {/* Sync Dataset Card */}
            <Card className="mb-6 border-blue-100 bg-blue-50/70 shadow-sm rounded-2xl">
              <CardContent className="py-4 px-4 sm:px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm sm:text-[15px] text-blue-900 max-w-2xl">
                  <p className="font-medium mb-1">Đồng bộ dữ liệu với Chatbot</p>
                  <p className="text-blue-800/90">
                    Sau khi chỉnh sửa Documents hoặc Prompting, hãy bấm nút đồng bộ để
                    cập nhật dataset cho chatbot (documents + prompting) trên server.
                  </p>
                </div>
                <div className="w-full sm:w-auto flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={handleSyncDataset}
                    disabled={isSyncing}
                    className="bg-blue-600 hover:bg-blue-700 text-white self-start min-w-[180px]"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang đồng bộ...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Đồng bộ dữ liệu
                      </>
                    )}
                  </Button>
                  {(isSyncing || syncProgress > 0) && (
                    <div className="flex items-center gap-3 text-xs text-blue-900">
                      <Progress
                        value={syncProgress}
                        className="flex-1 h-2 bg-blue-100"
                      />
                      <span className="w-10 text-right font-medium">
                        {Math.round(syncProgress)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            {/* <Card className="mb-6 border-blue-100 bg-blue-50/70 shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-blue-900 text-base sm:text-lg">
                  Tổng quan dataset Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm sm:text-[15px] text-blue-800 leading-relaxed">
                <p className="max-w-3xl">
                  Trang này cho phép bạn quản lý các tài liệu (documents) và cài đặt
                  prompt cho chatbot. Bạn có thể thêm, sửa và xóa các tài liệu cũng
                  như cấu hình prompt cho các loại người dùng khác nhau.
                </p>
              </CardContent>
            </Card> */}

            {/* Tabs */}
            <Tabs defaultValue="documents" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 rounded-full bg-white/70 shadow-sm mx-auto">
                <TabsTrigger
                  value="documents"
                  className="flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </TabsTrigger>
                <TabsTrigger
                  value="prompting"
                  className="flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Prompting</span>
                </TabsTrigger>
              </TabsList>

              {/* Documents Tab */}
              <TabsContent value="documents" className="space-y-6">
                <DocumentsManager
                  key={`documents-${refreshKey}`}
                  onDataUpdate={handleDataUpdate}
                />
              </TabsContent>

              {/* Prompting Tab */}
              <TabsContent value="prompting" className="space-y-6">
                <PromptingManager
                  key={`prompting-${refreshKey}`}
                  onDataUpdate={handleDataUpdate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
