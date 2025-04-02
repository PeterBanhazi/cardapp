import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import useAxios from '../utils/useAxios';
import { format } from 'date-fns';
import { useApiQuery } from '../utils/useDataQuery';
// import { Calendar as CalendarIcon } from 'lucide-react';
import {
    Modal,
    Button,
    Label,
    TextInput,
    Textarea,
    Datepicker,
    ModalHeader,
    ModalBody,
} from 'flowbite-react';

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
    avatar_image?: string;
    birthday: string | null;
}

interface PasswordChangeData {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
}

const axios = useAxios();
const ProfileEditModal: React.FC = () => {
    // State for modal
    const [isOpen, setIsOpen] = useState(false);

    // State for form data and errors
    const [profileData, setProfileData] = useState<ProfileData>({
        first_name: '',
        last_name: '',
        description: '',
        // avatar_image: AVATAR_OPTIONS[0],
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

    interface Option {
        id: number;
        name: string;
        description: string;
    }

    // Fetch options data
    const {
        data: initialProfileData,
        isLoading,
        error,
    } = useApiQuery<ProfileData[]>(['userProfile'], 'profile/');
    useEffect(() => {
        async function fetchdata() {
            const response = await axios.get('profile/');

            setProfileData(response.data);
            console.log(response.data);
        }
        fetchdata();
    }, []);

    // if (initialProfileData) {
    //     console.log(initialProfileData);
    //     (initialProfileData: React.SetStateAction<ProfileData>) =>
    //         setProfileData(initialProfileData);
    // }
    // Fetch profile data
    // const { data: initialProfileData, isLoading: isProfileLoading } = useQuery({
    //     queryKey: ['userProfile'],
    //     queryFn: async () => {
    //         const response = await axios.get('profile/');
    //         return response.data;
    //     },
    //     isSuccess: (data: ProfileData) => {
    //         setProfileData({
    //             first_name: data.first_name,
    //             last_name: data.last_name,
    //             description: data.description || '',
    //             avatar_image: data.avatar_image,
    //             birthday: data.birthday,
    //         });
    //     },
    // });

    // Profile update mutation
    const profileUpdateMutation = useMutation({
        mutationFn: async (data: ProfileData) => {
            const response = await axios.patch('profile/', data);
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
            const response = await axios.post('change-password/', data);
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
        <>
            <Button color="light" onClick={() => setIsOpen(true)}>
                Edit Profile
            </Button>

            <Modal show={isOpen} onClose={() => setIsOpen(false)} size="xl">
                <ModalHeader>Edit Profile</ModalHeader>
                <ModalBody className="max-h-[70vh] overflow-y-auto">
                    {/* Profile Information Form */}
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <h2 className="text-lg font-semibold">
                            Personal Information
                        </h2>

                        {/* First Name */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="firstName">First Name</Label>
                            </div>
                            <TextInput
                                id="firstName"
                                value={profileData.first_name}
                                onChange={(e) =>
                                    setProfileData((prev) => ({
                                        ...prev,
                                        first_name: e.target.value,
                                    }))
                                }
                                color={
                                    validationErrors.profile.first_name
                                        ? 'failure'
                                        : 'gray'
                                }
                            />
                            {validationErrors.profile.first_name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationErrors.profile.first_name}
                                </p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="lastName">Last Name</Label>
                            </div>
                            <TextInput
                                id="lastName"
                                value={profileData.last_name}
                                onChange={(e) =>
                                    setProfileData((prev) => ({
                                        ...prev,
                                        last_name: e.target.value,
                                    }))
                                }
                                color={
                                    validationErrors.profile.last_name
                                        ? 'failure'
                                        : 'gray'
                                }
                            />
                            {validationErrors.profile.last_name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationErrors.profile.last_name}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="description">Description</Label>
                            </div>
                            <Textarea
                                id="description"
                                value={profileData.description}
                                onChange={(e) =>
                                    setProfileData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                rows={3}
                                color={
                                    validationErrors.profile.description
                                        ? 'failure'
                                        : 'gray'
                                }
                            />
                            {validationErrors.profile.description && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationErrors.profile.description}
                                </p>
                            )}
                        </div>

                        {/* Avatar Selection */}
                        <div>
                            <Label className="block mb-2">Avatar</Label>
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
                                        className={`border-2 rounded-md p-1 hover:border-blue-500 transition-colors ${
                                            profileData.avatar_image === avatar
                                                ? 'border-blue-500'
                                                : 'border-transparent'
                                        }`}
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
                            <div className="mb-2 block">
                                <Label htmlFor="birthday">Birthday</Label>
                            </div>
                            <Datepicker
                                id="birthday"
                                value={
                                    profileData.birthday
                                        ? format(
                                              new Date(profileData.birthday),
                                              'PPP'
                                          )
                                        : ''
                                }
                                onSelectedDateChanged={(date) => {
                                    setProfileData((prev) => ({
                                        ...prev,
                                        birthday: date
                                            .toISOString()
                                            .split('T')[0],
                                    }));
                                }}
                                color={
                                    validationErrors.profile.birthday
                                        ? 'failure'
                                        : 'gray'
                                }
                            />
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
                            color="blue"
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
                        <h2 className="text-lg font-semibold">
                            Change Password
                        </h2>

                        {/* Current Password */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="currentPassword">
                                    Current Password
                                </Label>
                            </div>
                            <TextInput
                                id="currentPassword"
                                type="password"
                                value={passwordData.old_password}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        old_password: e.target.value,
                                    }))
                                }
                                color={
                                    validationErrors.password.old_password
                                        ? 'failure'
                                        : 'gray'
                                }
                            />
                            {validationErrors.password.old_password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationErrors.password.old_password}
                                </p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="newPassword">
                                    New Password
                                </Label>
                            </div>
                            <TextInput
                                id="newPassword"
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        new_password: e.target.value,
                                    }))
                                }
                                color={
                                    validationErrors.password.new_password
                                        ? 'failure'
                                        : 'gray'
                                }
                            />
                            {validationErrors.password.new_password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {validationErrors.password.new_password}
                                </p>
                            )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="confirmPassword">
                                    Confirm New Password
                                </Label>
                            </div>
                            <TextInput
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirm_new_password}
                                onChange={(e) =>
                                    setPasswordData((prev) => ({
                                        ...prev,
                                        confirm_new_password: e.target.value,
                                    }))
                                }
                                color={
                                    validationErrors.password
                                        .confirm_new_password
                                        ? 'failure'
                                        : 'gray'
                                }
                            />
                            {validationErrors.password.confirm_new_password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {
                                        validationErrors.password
                                            .confirm_new_password
                                    }
                                </p>
                            )}
                        </div>

                        {/* Password Change Button */}
                        <Button
                            type="submit"
                            disabled={passwordChangeMutation.isLoading}
                            color="blue"
                        >
                            {passwordChangeMutation.isLoading
                                ? 'Changing...'
                                : 'Change Password'}
                        </Button>
                    </form>
                </ModalBody>
            </Modal>
        </>
    );
};

export default ProfileEditModal;
