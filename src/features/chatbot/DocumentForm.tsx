import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Document, CreateDocumentRequest } from '@/model/ChatbotDataset';
import chatbotDatasetService from '@/features/chatbot/chatbotDatasetService';
import { Loader2 } from 'lucide-react';

interface DocumentFormProps {
  document?: Document | null;
  onSubmit?: () => void;
}

export default function DocumentForm({
  document,
  onSubmit,
}: DocumentFormProps) {
  const [description, setDescription] = useState(document?.description || '');
  const [content, setContent] = useState(document?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Tên document là bắt buộc';
    }
    if (!content.trim()) {
      newErrors.content = 'Nội dung là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (document) {
        // Update existing document
        await chatbotDatasetService.updateDocument(document.id, {
          description: description.trim(),
          content: content.trim(),
        });
        toast({
          title: 'Thành công',
          description: 'Document đã được cập nhật',
        });
      } else {
        // Create new document
        const request: CreateDocumentRequest = {
          description: description.trim(),
          content: content.trim(),
        };
        await chatbotDatasetService.createDocument(request);
        toast({
          title: 'Thành công',
          description: 'Document mới đã được tạo',
        });
      }

      onSubmit?.();
    } catch (error: unknown) {
      type ApiError = { response?: { data?: { message?: string } } };
      const apiError = error as ApiError | Error;

      const message =
        ('response' in apiError && apiError.response?.data?.message) ||
        (apiError instanceof Error
          ? apiError.message
          : 'Có lỗi xảy ra khi lưu document');
      toast({
        title: 'Lỗi',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Description Field */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-slate-700"
        >
          Tên Document
        </Label>
        <Input
          id="description"
          placeholder="Ví dụ: Quy định chung của ký túc xá"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: '' }));
            }
          }}
          className={`${
            errors.description ? 'border-red-500' : 'border-slate-200'
          } focus:ring-blue-500`}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Content Field */}
      <div className="space-y-2">
        <Label
          htmlFor="content"
          className="text-sm font-medium text-slate-700"
        >
          Nội dung
        </Label>
        <Textarea
          id="content"
          placeholder="Nhập nội dung chi tiết của tài liệu..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) {
              setErrors((prev) => ({ ...prev, content: '' }));
            }
          }}
          rows={8}
          className={`${
            errors.content ? 'border-red-500' : 'border-slate-200'
          } focus:ring-blue-500 font-mono text-sm`}
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>✓ {document ? 'Cập nhật' : 'Tạo mới'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
