import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Label,
    TextInput,
    RangeSlider,
    Button,
    Badge,
    Spinner,
} from 'flowbite-react';
import { RefreshCcw, ChevronDown } from 'lucide-react';
import { PlayerStats } from '@/shared/types/types';
import { useCreatePlayer } from './useCreatePlayer';

// Import player avatars
import djokovic from '@/assets/djokovic_head.png';
import alcaraz from '@/assets/alcaraz_head.png';
import sinner from '@/assets/sinner_head.png';
import medvedev from '@/assets/medvedev_head.png';
import rublev from '@/assets/rublev_head.png';

// ─── Types ────────────────────────────────────────────────────────────────────

type PlayerAbilities = Pick<
    PlayerStats,
    'serve' | 'forehand' | 'backhand' | 'volley' | 'stamina' | 'agility'
>;

interface Avatar {
    name: string;
    src: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATARS: Avatar[] = [
    { name: 'Novak Djokovic', src: djokovic },
    { name: 'Carlos Alcaraz', src: alcaraz },
    { name: 'Jannik Sinner', src: sinner },
    { name: 'Daniil Medvedev', src: medvedev },
    { name: 'Andrey Rublev', src: rublev },
];

const ABILITY_KEYS = [
    'serve',
    'forehand',
    'backhand',
    'volley',
    'stamina',
    'agility',
] as const;

const TOTAL_POINTS = 550;

const DEFAULT_ABILITIES: PlayerAbilities = {
    serve: 50,
    forehand: 50,
    backhand: 50,
    volley: 50,
    stamina: 50,
    agility: 50,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateRandomPlayerName(): string {
    return `TennisPlayer${Math.floor(1000 + Math.random() * 9000)}`;
}

function sumAbilities(abilities: PlayerAbilities): number {
    return ABILITY_KEYS.reduce((sum, key) => sum + abilities[key], 0);
}

// ─── AvatarDropdown ───────────────────────────────────────────────────────────
// Native <select> cannot render images inside <option> — this custom dropdown
// replicates the same UX with full image support.

interface AvatarDropdownProps {
    avatars: Avatar[];
    selected: Avatar;
    onChange: (avatar: Avatar) => void;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
    avatars,
    selected,
    onChange,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative mt-1">
            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 cursor-pointer
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none
                           dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
                <img
                    src={selected.src}
                    alt={selected.name}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                />
                <span className="flex-1 text-left">{selected.name}</span>
                <ChevronDown
                    size={16}
                    className={`flex-shrink-0 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Options list */}
            {open && (
                <ul
                    className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg
                               dark:border-gray-600 dark:bg-gray-700 overflow-hidden"
                >
                    {avatars.map((avatar) => {
                        const isSelected = avatar.name === selected.name;
                        return (
                            <li key={avatar.name}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(avatar);
                                        setOpen(false);
                                    }}
                                    className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer
                                        ${
                                            isSelected
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                                : 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <img
                                        src={avatar.src}
                                        alt={avatar.name}
                                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                                    />
                                    <span>{avatar.name}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

// ─── OptionsPlayerCreator ─────────────────────────────────────────────────────

interface OptionsPlayerCreatorProps {
    onClose: () => void;
}

const OptionsPlayerCreator: React.FC<OptionsPlayerCreatorProps> = ({
    onClose,
}) => {
    const [playerName, setPlayerName] = useState(generateRandomPlayerName);
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(AVATARS[0]);
    const [abilities, setAbilities] =
        useState<PlayerAbilities>(DEFAULT_ABILITIES);
    const [pendingAction, setPendingAction] = useState<
        'create' | 'play' | null
    >(null);

    const usedPoints = sumAbilities(abilities);
    const remainingPoints = TOTAL_POINTS - usedPoints;
    const isOverBudget = remainingPoints < 0;

    const { mutate: createPlayer, isPending } = useCreatePlayer(onClose);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleAbilityChange = (
        ability: keyof PlayerAbilities,
        raw: number
    ) => {
        const value = Math.min(100, Math.max(1, raw));
        const projected = usedPoints - abilities[ability] + value;
        if (projected <= TOTAL_POINTS) {
            setAbilities((prev) => ({ ...prev, [ability]: value }));
        }
    };

    const handleReset = () => {
        setPlayerName(generateRandomPlayerName());
        setSelectedAvatar(AVATARS[0]);
        setAbilities(DEFAULT_ABILITIES);
    };

    const handleSubmit = (action: 'create' | 'play') => {
        if (playerName.trim().length === 0 || playerName.length > 20) return;
        if (isOverBudget) return;

        setPendingAction(action);

        createPlayer(
            { name: playerName, avatar_url: selectedAvatar.src, ...abilities },
            {
                onSettled: () => setPendingAction(null),
                onSuccess: () => {
                    if (action === 'play') {
                        // TODO: router.push(`/game/${response.data.playerId}`)
                    }
                },
            }
        );
    };

    // ── Derived UI state ───────────────────────────────────────────────────────

    const pointsBadgeColor =
        remainingPoints === 0
            ? 'success'
            : remainingPoints < 50
              ? 'warning'
              : 'indigo';

    return (
        <Modal show dismissible onClose={onClose} size="sm">
            {/* Force number input spinners to always show */}
            <style>{`
                .ability-input::-webkit-inner-spin-button,
                .ability-input::-webkit-outer-spin-button {
                    opacity: 1;
                }
            `}</style>
            <ModalHeader>
                <div className="flex items-center gap-3">
                    <span>Create Player</span>
                    <button
                        type="button"
                        onClick={handleReset}
                        title="Reset to defaults"
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <RefreshCcw size={15} />
                    </button>
                </div>
            </ModalHeader>

            <ModalBody className="space-y-0 py-2">
                {/* Player Name */}
                <div className="">
                    <Label htmlFor="player-name">Player Name</Label>
                    <TextInput
                        id="player-name"
                        value={playerName}
                        maxLength={20}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Enter player name"
                        className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-400 text-right">
                        {playerName.length} / 20
                    </p>
                </div>

                {/* Avatar Dropdown */}
                <div>
                    <Label htmlFor="avatar-select">Avatar</Label>
                    <AvatarDropdown
                        avatars={AVATARS}
                        selected={selectedAvatar}
                        onChange={setSelectedAvatar}
                    />
                </div>

                {/* Ability Sliders */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-1">
                        <Label>Abilities</Label>
                        <Badge color={pointsBadgeColor}>
                            {remainingPoints} pts remaining
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        {ABILITY_KEYS.map((ability) => (
                            <div key={ability}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                                        {ability}
                                    </span>
                                    <input
                                        type="number"
                                        value={abilities[ability]}
                                        min={1}
                                        max={100}
                                        onChange={(e) =>
                                            handleAbilityChange(
                                                ability,
                                                parseInt(e.target.value) || 1
                                            )
                                        }
                                        className="ability-input text-sm px-1 w-12 rounded-md border border-gray-300
                                                   dark:border-gray-600 dark:bg-gray-700 dark:text-white
                                                   py-0.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <RangeSlider
                                    min={1}
                                    max={100}
                                    value={abilities[ability]}
                                    onChange={(e) =>
                                        handleAbilityChange(
                                            ability,
                                            parseInt(e.target.value)
                                        )
                                    }
                                    sizing="md"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </ModalBody>

            <ModalFooter className="flex gap-3">
                <Button
                    color="blue"
                    className="flex-1 cursor-pointer"
                    disabled={isOverBudget || isPending}
                    onClick={() => handleSubmit('create')}
                >
                    {isPending && pendingAction === 'create' && (
                        <Spinner size="sm" className="mr-2" />
                    )}
                    Create
                </Button>
                <Button
                    color="green"
                    className="flex-1 cursor-pointer"
                    disabled={isOverBudget || isPending}
                    onClick={() => handleSubmit('play')}
                >
                    {isPending && pendingAction === 'play' && (
                        <Spinner size="sm" className="mr-2" />
                    )}
                    Play
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default OptionsPlayerCreator;
