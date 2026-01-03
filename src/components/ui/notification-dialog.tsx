import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface NotificationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	type?: "error" | "success";
}

export function NotificationDialog({ open, onOpenChange, title, description, type = "error" }: NotificationDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="sm:max-w-md">
				<AlertDialogHeader>
					<div className="flex items-center gap-3">
						{type === "error" ? (
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
								<AlertCircle className="h-6 w-6 text-red-600" />
							</div>
						) : (
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
								<CheckCircle2 className="h-6 w-6 text-green-600" />
							</div>
						)}
						<AlertDialogTitle className={type === "error" ? "text-red-600" : "text-green-600"}>
							{title}
						</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="pt-3 text-left">{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogAction
						onClick={() => onOpenChange(false)}
						className={type === "error" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
					>
						Đóng
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
