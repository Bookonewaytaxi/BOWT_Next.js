import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KeywordStatusBadge({ status = 'missing' }) {
  const config = {
    present: {
      icon: CheckCircle2,
      text: "Present",
      className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
    },
    partial: {
      icon: AlertTriangle,
      text: "Partial",
      className: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
    },
    missing: {
      icon: XCircle,
      text: "Not Found",
      className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
    }
  };

  const { icon: Icon, text, className } = config[status] || config.missing;

  return (
    <Badge variant="outline" className={cn("gap-1 pr-2", className)}>
      <Icon className="w-3 h-3" />
      <span>{text}</span>
    </Badge>
  );
}