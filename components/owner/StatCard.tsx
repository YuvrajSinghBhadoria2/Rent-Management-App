'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: 'default' | 'green' | 'red' | 'blue' | 'amber';
    icon: LucideIcon;
}

const colorMap = {
    default: 'text-gray-900 dark:text-white',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
};

const bgMap = {
    default: 'bg-gray-500/10',
    green: 'bg-green-500/10',
    red: 'bg-red-500/10',
    blue: 'bg-blue-500/10',
    amber: 'bg-amber-500/10',
};

export function StatCard({ label, value, sub, trend, color = 'default', icon: Icon }: StatCardProps) {
    return (
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 animate-fade-in">
            {/* Background Icon Glow */}
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity",
                colorMap[color]
            )}>
                <Icon className="w-full h-full" />
            </div>

            <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
                        {label}
                    </span>
                    <div className={cn("p-2 rounded-xl transition-colors", bgMap[color])}>
                        <Icon className={cn("w-4 h-4", colorMap[color])} />
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mt-1">
                    <span className={cn("text-2xl font-bold tracking-tight", colorMap[color])}>
                        {value}
                    </span>
                </div>

                {sub && (
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">
                        {sub}
                    </span>
                )}
            </div>

            {/* Modern bottom highlight */}
            <div className={cn(
                "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r",
                color === 'green' ? "from-green-500 to-emerald-400" :
                    color === 'red' ? "from-red-500 to-rose-400" :
                        color === 'blue' ? "from-blue-500 to-primary" :
                            color === 'amber' ? "from-amber-500 to-orange-400" :
                                "from-gray-500 to-gray-400"
            )} />
        </div>
    );
}
