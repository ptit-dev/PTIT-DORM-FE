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
import { Document } from '@/model/ChatbotDataset';
import chatbotDatasetService from '@/features/chatbot/chatbotDatasetService';
import DocumentForm from '@/features/chatbot/DocumentForm';
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

interface DocumentsManagerProps {
  onDataUpdate?: () => void;
}

export default function DocumentsManager({
  onDataUpdate,
}: DocumentsManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatbotDatasetService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleAddDocument = () => {
    setEditingDocument(null);
    setIsOpen(true);
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setIsOpen(true);
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      setIsDeleting(true);
      await chatbotDatasetService.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      setDeletingId(null);
      toast({
        title: 'Thành công',
        description: 'Document đã được xóa',
      });
      onDataUpdate?.();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa document',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async () => {
    await fetchDocuments();
    setIsOpen(false);
    setEditingDocument(null);
    onDataUpdate?.();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Documents
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {documents.length} tài liệu
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddDocument}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDocument ? 'Sửa Document' : 'Thêm Document Mới'}
              </DialogTitle>
              <DialogDescription>
                {editingDocument
                  ? 'Cập nhật thông tin tài liệu'
                  : 'Tạo một tài liệu mới cho chatbot'}
              </DialogDescription>
            </DialogHeader>
            <DocumentForm
              document={editingDocument}
              onSubmit={handleFormSubmit}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents Table */}
      <Card className="border-slate-200 bg-white/80 shadow-sm rounded-2xl">
        <CardContent className="pt-4 sm:pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Chưa có document nào</p>
              <p className="text-sm text-slate-400 mt-1">
                Hãy thêm document mới để bắt đầu
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 hover:bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold w-1/4">
                      Tên
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold w-1/3">
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
                  {documents.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="border-slate-200 hover:bg-blue-50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {doc.description}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="line-clamp-2 text-sm">
                          {doc.content}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(doc.created_at)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {formatDate(doc.updated_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDocument(doc)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogAction
                              onClick={() => setDeletingId(doc.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </AlertDialogAction>
                            {deletingId === doc.id && (
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xóa?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Document
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
                                      handleDeleteDocument(doc.id)
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
