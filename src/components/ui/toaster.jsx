import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import React from 'react';

export function Toaster() {
	const { toasts } = useToast();

	const getIcon = (variant) => {
		switch (variant) {
			case 'success':
				return <CheckCircle2 className="h-5 w-5 text-white" />;
			case 'destructive':
			case 'error':
				return <AlertCircle className="h-5 w-5 text-white" />;
			case 'warning':
				return <AlertTriangle className="h-5 w-5 text-black" />;
			case 'info':
				return <Info className="h-5 w-5 text-white" />;
			default:
				return null;
		}
	};

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, variant, ...props }) => {
				return (
					<Toast key={id} variant={variant} {...props}>
						<div className="flex gap-3">
							{getIcon(variant) && (
								<div className="mt-0.5 shrink-0">{getIcon(variant)}</div>
							)}
							<div className="grid gap-1">
								{title && <ToastTitle>{title}</ToastTitle>}
								{description && (
									<ToastDescription>{description}</ToastDescription>
								)}
							</div>
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}