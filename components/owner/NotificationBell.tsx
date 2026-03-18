'use client';

import { useState, useEffect } from 'react';
import {
    Bell,
    Check,
    Clock,
    AlertTriangle,
    Info,
    CreditCard,
    User,
    CheckCircle2
} from 'lucide-react';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    doc,
    writeBatch,
    getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: any;
    type?: 'payment' | 'complaint' | 'lease' | 'info';
}

const iconMap = {
    payment: { icon: CreditCard, color: 'text-green-500 bg-green-500/10' },
    complaint: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10' },
    lease: { icon: User, color: 'text-blue-500 bg-blue-500/10' },
    info: { icon: Info, color: 'text-gray-500 bg-gray-500/10' },
    default: { icon: Bell, color: 'text-primary bg-primary/10' }
};

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Notification[];
            setNotifications(items);
            setUnreadCount(items.filter(n => !n.isRead).length);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await updateDoc(doc(db, 'notifications', id), { isRead: true });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', user.uid),
                where('isRead', '==', false)
            );
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach((d) => {
                batch.update(d.ref, { isRead: true });
            });
            await batch.commit();
            toast.success('All marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to update notifications');
        }
    };

    return (
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full hover:bg-white/10 transition-colors group"
                    >
                        <Bell className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-black animate-in zoom-in">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                }
            />
            <PopoverContent className="w-80 p-0 glass-card border-white/20 shadow-2xl overflow-hidden" align="end">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h4 className="font-bold text-sm tracking-tight">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllRead}
                            className="h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-80">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {notifications.map((n) => {
                                const type = (n.type || 'default') as keyof typeof iconMap;
                                const { icon: Icon, color } = iconMap[type] || iconMap.default;
                                return (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "p-4 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer group relative",
                                            !n.isRead && "bg-primary/5"
                                        )}
                                        onClick={() => !n.isRead && markAsRead(n.id)}
                                    >
                                        <div className={cn("shrink-0 w-8 h-8 rounded-full flex items-center justify-center", color)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn("text-xs font-bold leading-none", !n.isRead ? "text-gray-900 dark:text-white" : "text-gray-500")}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[9px] text-gray-400 whitespace-nowrap font-medium italic">
                                                    {n.createdAt && formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                                <Bell className="h-6 w-6 text-gray-300 dark:text-gray-700" />
                            </div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nothing here yet</p>
                            <p className="text-[10px] text-gray-400 mt-1 max-w-[140px]">We'll notify you when something important happens.</p>
                        </div>
                    )}
                </ScrollArea>
                <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                    <Button variant="link" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        View all activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
