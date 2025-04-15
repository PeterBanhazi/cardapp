import React, { useEffect, useState } from 'react';

import {
    Modal,
    Button,
    Label,
    TextInput,
    Textarea,
    Datepicker,
    ModalHeader,
    ModalBody,
    ThemeProvider,
} from 'flowbite-react';
import { ProfileData, PasswordChangeData } from '../../utils/types';
import {
    useProfile,
    useUpdateProfile,
    useProfilePasswordChange,
} from '../../utils/useDataQuery';
import ModalOpenTriggerButton from './ModalOpenTriggerButton';
import { customTheme } from '../../utils/formThemes';

// TODO: when there is no birthday and user logout and login with another account the prv. bd should have been invalidated
// Input field configuration for consistent styling

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

const ProfileEditModal: React.FC<{}> = ({}) => {
    // State for modal
    const [openModal, setOpenModal] = useState(false);

    // State for form data and errors
    const [profileData, setProfileData] = useState<ProfileData>({
        username: '',
        first_name: '',
        last_name: '',
        description: '',
        // avatar_image: AVATAR_OPTIONS[0],
        birthday: '',
    });

    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    });
    const [bdayData, setbdayData] = useState<Date>();

    const [validationErrors, setValidationErrors] = useState<{
        profile: Partial<Record<keyof ProfileData, string>>;
        password: Partial<Record<keyof PasswordChangeData, string>>;
    }>({
        profile: {},
        password: {},
    });

    // Fetch profile data

    const getProfile = useProfile();
    const initialProfileData = getProfile.data;

    useEffect(() => {
        if (initialProfileData) {
            setProfileData({
                username: initialProfileData.username,
                first_name: initialProfileData.first_name,
                last_name: initialProfileData.last_name,
                description: initialProfileData.description || '',
                avatar_image: initialProfileData.avatar_image,
                birthday: initialProfileData.birthday || null,
            });
        }
        if (initialProfileData?.birthday) {
            // Convert YYYY-MM-DD string to Date object
            const [year, month, day] = initialProfileData.birthday.split('-');
            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
            );
            setbdayData(date);
        }
    }, [initialProfileData]);

    // Profile update mutation

    const updateProfile = useUpdateProfile();

    // Password change mutation
    const passwordChangeMutation = useProfilePasswordChange();

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
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateProfileData()) {
            await updateProfile.mutateAsync(profileData);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePasswordData()) {
            await passwordChangeMutation.mutateAsync(passwordData);
        }
        setPasswordData({
            old_password: '',
            new_password: '',
            confirm_new_password: '',
        });
    };

    const handleDateChange = (
        datetoset: React.SetStateAction<Date | undefined> | null
    ) => {
        if (datetoset) {
            setbdayData(datetoset);
            parseandSetDateBack(datetoset);
        }
    };
    const parseandSetDateBack = (date: any) => {
        if (date !== null) {
            const year = date!.getFullYear();
            // Month is 0-indexed in JS Date, so add 1 and ensure two digits
            const month = String(date!.getMonth() + 1).padStart(2, '0');
            const day = String(date!.getDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;

            setProfileData((prev) => ({
                ...prev,
                birthday: formattedDate,
            }));
        }
    };
    return (
        <>
            <ModalOpenTriggerButton
                buttonText="Settings"
                onClick={() => setOpenModal(true)}
            />
            <ThemeProvider theme={customTheme}>
                <Modal
                    id="profile-modal"
                    dismissible={true}
                    show={openModal}
                    onClose={() => setOpenModal(false)}
                    size="xl"
                >
                    <ModalHeader className="">
                        Edit Profile (
                        {getProfile.isLoading
                            ? 'Loading...'
                            : profileData.username}
                        )
                    </ModalHeader>
                    <ModalBody className="max-h-[80vh] overflow-y-auto">
                        {/* Profile Information Form */}
                        <form
                            onSubmit={handleProfileSubmit}
                            className="space-y-4"
                        >
                            <h2 className="text-lg font-semibold">
                                Personal Information
                            </h2>

                            {/* First Name */}
                            <div>
                                <div className="mb-2 block">
                                    <Label htmlFor="firstName">
                                        First Name
                                    </Label>
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
                                            : 'tennisprimary'
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
                                            : 'tennisprimary'
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
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
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
                                    className="border-gray-300 bg-gray-50 focus:border-orange-500 focus:border focus:ring-orange-500"
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
                                            className={`border-2 rounded-md p-1 hover:border-orange-500 transition-colors ${
                                                profileData.avatar_image ===
                                                avatar
                                                    ? 'border-orange-500'
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
                                    maxDate={new Date()}
                                    showTodayButton={false}
                                    defaultValue={bdayData}
                                    value={bdayData}
                                    onChange={(value) =>
                                        handleDateChange(value)
                                    }
                                    color={
                                        validationErrors.profile.birthday
                                            ? 'failure'
                                            : 'tennisprimary'
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
                                disabled={updateProfile.isPending}
                                color="tennisprimary"
                            >
                                {updateProfile.isPending
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
                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    autoComplete="username"
                                    className="hidden"
                                />
                                <TextInput
                                    id="currentPassword"
                                    type="password"
                                    autoComplete="off"
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
                                            : 'tennisprimary'
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
                                    autoComplete="new-password"
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
                                            : 'tennisprimary'
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
                                    autoComplete="new-password"
                                    value={passwordData.confirm_new_password}
                                    onChange={(e) =>
                                        setPasswordData((prev) => ({
                                            ...prev,
                                            confirm_new_password:
                                                e.target.value,
                                        }))
                                    }
                                    color={
                                        validationErrors.password
                                            .confirm_new_password
                                            ? 'failure'
                                            : 'tennisprimary'
                                    }
                                />
                                {validationErrors.password
                                    .confirm_new_password && (
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
                                disabled={passwordChangeMutation.isPending}
                                color="tennisprimary"
                            >
                                {passwordChangeMutation.isPending
                                    ? 'Changing...'
                                    : 'Change Password'}
                            </Button>
                        </form>
                    </ModalBody>
                    <div className="h-1" />
                </Modal>
            </ThemeProvider>
        </>
    );
};

export default ProfileEditModal;
