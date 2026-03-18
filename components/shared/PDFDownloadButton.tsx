'use client';

import { useState } from 'react';
import { Download, Loader2, FileText, Receipt, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PDFType = 'receipt' | 'invoice' | 'ledger' | 'lease';

interface PDFDownloadButtonProps {
    type: PDFType;
    data: Record<string, unknown>;
    filename?: string;
    label?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'icon';
    className?: string;
    disabled?: boolean;
}

const typeConfig: Record<PDFType, { icon: typeof FileText; label: string }> = {
    receipt: { icon: Receipt, label: 'Download Receipt' },
    invoice: { icon: FileText, label: 'Download Invoice' },
    ledger: { icon: FileSpreadsheet, label: 'Download Ledger' },
    lease: { icon: FileText, label: 'Download Lease' },
};

export function PDFDownloadButton({
    type,
    data,
    filename,
    label,
    variant = 'outline',
    size = 'default',
    className,
    disabled,
}: PDFDownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const config = typeConfig[type];
    const Icon = config.icon;
    const buttonLabel = label || config.label;

    async function handleDownload() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('firebase-token');
            const response = await fetch('/api/payments/download-receipt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    type,
                    ...data,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `${type}-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('PDF download error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    if (size === 'icon') {
        return (
            <Button
                variant={variant}
                size="icon"
                onClick={handleDownload}
                disabled={isLoading || disabled}
                className={className}
                title={buttonLabel}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Icon className="h-4 w-4" />
                )}
            </Button>
        );
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleDownload}
            disabled={isLoading || disabled}
            className={cn('gap-2', className)}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {buttonLabel}
        </Button>
    );
}
