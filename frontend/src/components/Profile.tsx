import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Input field configuration for consistent styling
const INPUT_STYLES = {
    base: 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2',
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-200',
    disabled: 'bg-gray-100 cursor-not-allowed',
};

// Avatar options matching backend
const AVATAR_OPTIONS = [
    'avatar1.png',
    'avatar2.png',
    'avatar3.png',
    'avatar4.png',
    'avatar5.png',
    'avatar6.png',
    'avatar7.png',
    'avatar8.png',
    'avatar9.png',
    'avatar10.png',
];

// Type definitions
interface ProfileData {
    first_name: string;
    last_name: string;
    description: string;
    avatar_image: string;
    birthday: string | null;
}

interface PasswordChangeData {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
}

const ProfileEditModal: React.FC = () => {
    // State for form data and errors
    const [profileData, setProfileData] = useState<ProfileData>({
        first_name: '',
        last_name: '',
        description: '',
        avatar_image: AVATAR_OPTIONS[0],
        birthday: null,
    });

    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    });

    const [validationErrors, setValidationErrors] = useState<{
        profile: Partial<Record<keyof ProfileData, string>>;
        password: Partial<Record<keyof PasswordChangeData, string>>;
    }>({
        profile: {},
        password: {},
    });

    // Fetch profile data
    const { data: initialProfileData, isLoading: isProfileLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await axios.get('/api/profile/');
            return response.data;
        },
        onSuccess: (data) => {
            setProfileData({
                first_name: data.first_name,
                last_name: data.last_name,
                description: data.description || '',
                avatar_image: data.avatar_image,
                birthday: data.birthday,
            });
        },
    });

    // Profile update mutation
    const profileUpdateMutation = useMutation({
        mutationFn: async (data: ProfileData) => {
            const response = await axios.patch('/api/profile/', data);
            return response.data;
        },
        onError: (error) => {
            // Handle API errors
            console.error('Profile update error', error);
        },
    });

    // Password change mutation
    const passwordChangeMutation = useMutation({
        mutationFn: async (data: PasswordChangeData) => {
            const response = await axios.post('/api/change-password/', data);
            return response.data;
        },
        onError: (error) => {
            console.error('Password change error', error);
        },
    });

    // Validation functions
    const validateProfileData = (): boolean => {
        const errors: Partial<Record<keyof ProfileData, string>> = {};

        // First name validation
        if (!profileData.first_name.trim()) {
            errors.first_name = 'First name is required';
        } else if (profileData.first_name.length > 50) {
            errors.first_name = 'First name must be less than 50 characters';
        }

        // Last name validation
        if (!profileData.last_name.trim()) {
            errors.last_name = 'Last name is required';
        } else if (profileData.last_name.length > 50) {
            errors.last_name = 'Last name must be less than 50 characters';
        }

        // Description validation
        if (profileData.description && profileData.description.length > 500) {
            errors.description = 'Description must be less than 500 characters';
        }

        // Birthday validation
        if (profileData.birthday) {
            const selectedDate = new Date(profileData.birthday);
            const today = new Date();
            if (selectedDate > today) {
                errors.birthday = 'Birthday cannot be in the future';
            }
        }

        setValidationErrors((prev) => ({ ...prev, profile: errors }));
        return Object.keys(errors).length === 0;
    };

    const validatePasswordData = (): boolean => {
        const errors: Partial<Record<keyof PasswordChangeData, string>> = {};

        // Old password validation
        if (!passwordData.old_password.trim()) {
            errors.old_password = 'Current password is required';
        }

        // New password validation
        if (!passwordData.new_password.trim()) {
            errors.new_password = 'New password is required';
        } else if (passwordData.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters';
        }

        // Confirm password validation
        if (passwordData.new_password !== passwordData.confirm_new_password) {
            errors.confirm_new_password = 'Passwords do not match';
        }

        setValidationErrors((prev) => ({ ...prev, password: errors }));
        return Object.keys(errors).length === 0;
    };

    // Form submission handlers
    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateProfileData()) {
            profileUpdateMutation.mutate(profileData);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePasswordData()) {
            passwordChangeMutation.mutate(passwordData);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                {/* Profile Information Form */}
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Personal Information
                    </h2>

                    {/* First Name */}
                    <div>
                        <label className="block mb-2">First Name</label>
                        <input
                            type="text"
                            value={profileData.first_name}
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    first_name: e.target.value,
                                }))
                            }
                            className={cn(
                                INPUT_STYLES.base,
                                INPUT_STYLES.default,
                                validationErrors.profile.first_name &&
                                    INPUT_STYLES.error
                            )}
                        />
                        {validationErrors.profile.first_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.profile.first_name}
                            </p>
                        )}
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block mb-2">Last Name</label>
                        <input
                            type="text"
                            value={profileData.last_name}
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    last_name: e.target.value,
                                }))
                            }
                            className={cn(
                                INPUT_STYLES.base,
                                INPUT_STYLES.default,
                                validationErrors.profile.last_name &&
                                    INPUT_STYLES.error
                            )}
                        />
                        {validationErrors.profile.last_name && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.profile.last_name}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-2">Description</label>
                        <textarea
                            value={profileData.description}
                            onChange={(e) =>
                                setProfileData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            className={cn(
                                INPUT_STYLES.base,
                                INPUT_STYLES.default,
                                validationErrors.profile.description &&
                                    INPUT_STYLES.error
                            )}
                            rows={3}
                        />
                        {validationErrors.profile.description && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.profile.description}
                            </p>
                        )}
                    </div>

                    {/* Avatar Selection */}
                    <div>
                        <label className="block mb-2">Avatar</label>
                        <div className="grid grid-cols-5 gap-2">
                            {AVATAR_OPTIONS.map((avatar) => (
                                <button
                                    key={avatar}
                                    type="button"
                                    onClick={() =>
                                        setProfileData((prev) => ({
                                            ...prev,
                                            avatar_image: avatar,
                                        }))
                                    }
                                    className={cn(
                                        'border-2 rounded-md p-1 hover:border-blue-500 transition-colors',
                                        profileData.avatar_image === avatar
                                            ? 'border-blue-500'
                                            : 'border-transparent'
                                    )}
                                >
                                    <img
                                        src={`/avatars/${avatar}`}
                                        alt={avatar}
                                        className="w-16 h-16 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Birthday */}
                    <div>
                        <label className="block mb-2">Birthday</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !profileData.birthday &&
                                            'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {profileData.birthday ? (
                                        format(
                                            new Date(profileData.birthday),
                                            'PPP'
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={
                                        profileData.birthday
                                            ? new Date(profileData.birthday)
                                            : undefined
                                    }
                                    onSelect={(date) =>
                                        setProfileData((prev) => ({
                                            ...prev,
                                            birthday: date
                                                ? date
                                                      .toISOString()
                                                      .split('T')[0]
                                                : null,
                                        }))
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {validationErrors.profile.birthday && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.profile.birthday}
                            </p>
                        )}
                    </div>

                    {/* Profile Update Button */}
                    <Button
                        type="submit"
                        disabled={profileUpdateMutation.isLoading}
                    >
                        {profileUpdateMutation.isLoading
                            ? 'Updating...'
                            : 'Update Profile'}
                    </Button>
                </form>

                {/* Password Change Form */}
                <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4 mt-6"
                >
                    <h2 className="text-lg font-semibold">Change Password</h2>

                    {/* Current Password */}
                    <div>
                        <label className="block mb-2">Current Password</label>
                        <input
                            type="password"
                            value={passwordData.old_password}
                            onChange={(e) =>
                                setPasswordData((prev) => ({
                                    ...prev,
                                    old_password: e.target.value,
                                }))
                            }
                            className={cn(
                                INPUT_STYLES.base,
                                INPUT_STYLES.default,
                                validationErrors.password.old_password &&
                                    INPUT_STYLES.error
                            )}
                        />
                        {validationErrors.password.old_password && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.password.old_password}
                            </p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block mb-2">New Password</label>
                        <input
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) =>
                                setPasswordData((prev) => ({
                                    ...prev,
                                    new_password: e.target.value,
                                }))
                            }
                            className={cn(
                                INPUT_STYLES.base,
                                INPUT_STYLES.default,
                                validationErrors.password.new_password &&
                                    INPUT_STYLES.error
                            )}
                        />
                        {validationErrors.password.new_password && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.password.new_password}
                            </p>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="block mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={passwordData.confirm_new_password}
                            onChange={(e) =>
                                setPasswordData((prev) => ({
                                    ...prev,
                                    confirm_new_password: e.target.value,
                                }))
                            }
                            className={cn(
                                INPUT_STYLES.base,
                                INPUT_STYLES.default,
                                validationErrors.password
                                    .confirm_new_password && INPUT_STYLES.error
                            )}
                        />
                        {validationErrors.password.confirm_new_password && (
                            <p className="text-red-500 text-sm mt-1">
                                {validationErrors.password.confirm_new_password}
                            </p>
                        )}
                    </div>

                    {/* Password Change Button */}
                    <Button
                        type="submit"
                        disabled={passwordChangeMutation.isLoading}
                    >
                        {passwordChangeMutation.isLoading
                            ? 'Changing...'
                            : 'Change Password'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileEditModal;
