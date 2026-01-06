import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Prompting, CreatePromptingRequest } from '@/model/ChatbotDataset';
import chatbotDatasetService from '@/features/chatbot/chatbotDatasetService';
import { Loader2 } from 'lucide-react';

interface PromptingFormProps {
  prompting?: Prompting | null;
  onSubmit?: () => void;
}

const PROMPT_TYPES = [
  { value: 'general', label: 'General (Chung)' },
  { value: 'student', label: 'Student (Sinh viên)' },
  { value: 'manager', label: 'Manager (Quản lý)' },
  { value: 'admin_system', label: 'Admin System (Quản trị)' },
  { value: 'guest', label: 'Guest (Khách)' },
];

export default function PromptingForm({
  prompting,
  onSubmit,
}: PromptingFormProps) {
  const [type, setType] = useState(prompting?.type || 'general');
  const [content, setContent] = useState(prompting?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!type.trim()) {
      newErrors.type = 'Loại prompt là bắt buộc';
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

      if (prompting) {
        // Update existing prompting
        await chatbotDatasetService.updatePrompting(prompting.id, {
          type: type.trim(),
          content: content.trim(),
        });
        toast({
          title: 'Thành công',
          description: 'Prompting đã được cập nhật',
        });
      } else {
        // Create new prompting
        const request: CreatePromptingRequest = {
          type: type.trim(),
          content: content.trim(),
        };
        await chatbotDatasetService.createPrompting(request);
        toast({
          title: 'Thành công',
          description: 'Prompting mới đã được tạo',
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
          : 'Có lỗi xảy ra khi lưu prompting');
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
      {/* Type Field */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-sm font-medium text-slate-700">
          Loại Prompt
        </Label>
        <Select value={type} onValueChange={setType} disabled={isSubmitting}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn loại prompt" />
          </SelectTrigger>
          <SelectContent>
            {PROMPT_TYPES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type}</p>
        )}
      </div>

      {/* Content Field */}
      <div className="space-y-2">
        <Label
          htmlFor="content"
          className="text-sm font-medium text-slate-700"
        >
          Nội dung Prompt
        </Label>
        <Textarea
          id="content"
          placeholder="Ví dụ: Bạn là trợ lý hỗ trợ sinh viên hỏi về ký túc xá PTIT. Hãy trả lời các câu hỏi một cách thân thiện, chuyên nghiệp và cung cấp thông tin chính xác..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) {
              setErrors((prev) => ({ ...prev, content: '' }));
            }
          }}
          rows={10}
          className={`${
            errors.content ? 'border-red-500' : 'border-slate-200'
          } focus:ring-purple-500 font-mono text-sm`}
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content}</p>
        )}
        <p className="text-xs text-slate-500 mt-2">
          💡 Viết prompt chi tiết để hướng dẫn AI trả lời theo cách bạn muốn
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>✓ {prompting ? 'Cập nhật' : 'Tạo mới'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
