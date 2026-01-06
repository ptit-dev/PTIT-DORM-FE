import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Prompting } from '@/model/ChatbotDataset';
import chatbotDatasetService from '@/features/chatbot/chatbotDatasetService';
import PromptingForm from '@/features/chatbot/PromptingForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Edit2, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface PromptingManagerProps {
  onDataUpdate?: () => void;
}

const typeColors: Record<string, string> = {
  student: 'bg-blue-100 text-blue-800',
  manager: 'bg-purple-100 text-purple-800',
  admin_system: 'bg-red-100 text-red-800',
  guest: 'bg-green-100 text-green-800',
  general: 'bg-gray-100 text-gray-800',
};

export default function PromptingManager({
  onDataUpdate,
}: PromptingManagerProps) {
  const [promptings, setPromptings] = useState<Prompting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPrompting, setEditingPrompting] = useState<Prompting | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchPromptings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatbotDatasetService.getPromptings();
      setPromptings(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách prompting',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchPromptings();
  }, [fetchPromptings]);

  const handleAddPrompting = () => {
    setEditingPrompting(null);
    setIsOpen(true);
  };

  const handleEditPrompting = (prompting: Prompting) => {
    setEditingPrompting(prompting);
    setIsOpen(true);
  };

  const handleDeletePrompting = async (id: string) => {
    try {
      setIsDeleting(true);
      await chatbotDatasetService.deletePrompting(id);
      setPromptings((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
      toast({
        title: 'Thành công',
        description: 'Prompting đã được xóa',
      });
      onDataUpdate?.();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa prompting',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async () => {
    await fetchPromptings();
    setIsOpen(false);
    setEditingPrompting(null);
    onDataUpdate?.();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type: string) => {
    return typeColors[type] || typeColors.general;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Prompting
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {promptings.length} prompt
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddPrompting}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Prompting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrompting ? 'Sửa Prompting' : 'Thêm Prompting Mới'}
              </DialogTitle>
              <DialogDescription>
                {editingPrompting
                  ? 'Cập nhật nội dung prompt'
                  : 'Tạo một prompt mới cho chatbot'}
              </DialogDescription>
            </DialogHeader>
            <PromptingForm
              prompting={editingPrompting}
              onSubmit={handleFormSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="border-purple-200 bg-purple-50/80 rounded-2xl">
        <CardContent className="pt-6">
          <p className="text-sm text-purple-800">
            💡 <strong>Mẹo:</strong> Prompt là hướng dẫn cho AI trả lời. Bạn có
            thể tạo prompt khác nhau cho từng loại người dùng (sinh viên, quản
            lý, khách, v.v.) để có trải nghiệm chat tối ưu.
          </p>
        </CardContent>
      </Card>

      {/* Prompting Table */}
      <Card className="border-slate-200 bg-white/80 shadow-sm rounded-2xl">
        <CardContent className="pt-4 sm:pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : promptings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Chưa có prompting nào</p>
              <p className="text-sm text-slate-400 mt-1">
                Hãy thêm prompting mới để bắt đầu
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold w-1/6">
                      Loại
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold w-1/2">
                      Nội dung
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold w-1/6">
                      Tạo lúc
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold w-1/6">
                      Sửa lúc
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold text-right w-1/6">
                      Hành động
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promptings.map((p) => (
                    <TableRow
                      key={p.id}
                      className="border-slate-200 hover:bg-purple-50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                            p.type
                          )}`}
                        >
                          {p.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="line-clamp-2 text-sm">{p.content}</div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(p.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(p.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPrompting(p)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogAction
                              onClick={() => setDeletingId(p.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </AlertDialogAction>
                            {deletingId === p.id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xóa?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Prompting
                                    sẽ bị xóa vĩnh viễn.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="flex gap-3">
                                  <AlertDialogCancel
                                    onClick={() => setDeletingId(null)}
                                  >
                                    Hủy
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeletePrompting(p.id)
                                    }
                                    disabled={isDeleting}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isDeleting ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Đang xóa...
                                      </>
                                    ) : (
                                      'Xóa'
                                    )}
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            )}
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
