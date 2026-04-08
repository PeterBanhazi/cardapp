import { X, Star, User } from 'lucide-react';
import { FriendDisplayUser } from '@/shared/types/friendTypes';

// Helper for not accepted relations avatar

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

export const FriendInfoContent: React.FC<{
    user: FriendDisplayUser;
    onClose: () => void;
}> = ({ user, onClose }) => (
    <div className="flex flex-col gap-3 w-52 relative">
        {/* Close button — only closes popover, not dropdown */}
        <button
            onClick={onClose}
            className="cursor-pointer absolute top-0 right-0 p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
        >
            <X className="w-3.5 h-3.5" />
        </button>

        {/* Header — avatar + username + rankpoints */}
        <div className="flex items-center gap-3 pr-5">
            <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden ring-2 ring-slate-200 bg-slate-100 flex items-center justify-center">
                {user.avatar_image ? (
                    <img
                        src={`/avatars/${user.avatar_image}`}
                        alt={user.username}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-sm font-bold text-slate-500">
                        {getInitials(user.username)}
                    </span>
                )}
            </div>

            <div className="min-w-0 flex flex-col gap-0.5">
                <span className="font-semibold text-sm text-slate-800 truncate">
                    {user.username}
                </span>
                {user.rankpoints !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                        {user.rankpoints} pts
                    </span>
                )}
            </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Current player card */}
        {user.current_player ? (
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Current Player
                </p>
                <div className="flex items-center gap-2 bg-slate-50 rounded-md px-2 py-1.5 ring-1 ring-slate-200">
                    <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                        {user.current_player.avatar_url ? (
                            <img
                                src={user.current_player.avatar_url}
                                alt={user.current_player.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-4 h-4 text-slate-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">
                            {user.current_player.name}
                        </p>
                        <p className="text-xs text-slate-400">
                            #{user.current_player.id}
                        </p>
                    </div>
                </div>
            </div>
        ) : (
            <p className="text-xs text-slate-400 italic">
                No active player selected.
            </p>
        )}
    </div>
);
