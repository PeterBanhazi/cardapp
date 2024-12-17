import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

interface UserProperties {
    isonline: boolean;
    friends: string;
    customplayers: string;
    favoriteplayers: string;
}

const UserPropertiesComponent: React.FC = () => {
    const [userProperties, setUserProperties] = useState<UserProperties>({
        isonline: false,
        friends: '',
        customplayers: '',
        favoriteplayers: '',
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const jwtToken = localStorage.getItem('token');

    // Fetch User Properties
    const fetchUserProperties = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/userproperties/', {
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                },
            });

            setUserProperties(response.data);
        } catch (err) {
            setError('Failed to fetch user properties.');
        } finally {
            setLoading(false);
        }
    };

    // Update User Properties
    const updateUserProperties = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            const response = await axios.post(
                '/api/userproperties/',
                userProperties,
                {
                    headers: {
                        Authorization: `Bearer ${jwtToken}`,
                    },
                }
            );

            setSuccessMessage('User properties updated successfully.');
        } catch (err) {
            setError('Failed to update user properties.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user properties on component mount
    useEffect(() => {
        if (!jwtToken) {
            setError('No JWT token found. Please log in.');
            return;
        }

        try {
            jwtDecode(jwtToken); // Verify token validity
            fetchUserProperties();
        } catch {
            setError('Invalid token. Please log in again.');
        }
    }, []);

    // Handle input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type, checked } = e.target;

        setUserProperties((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h1 className="text-2xl font-bold mb-4">User Properties</h1>

            {loading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {successMessage && (
                <p className="text-green-500">{successMessage}</p>
            )}

            {/* Form */}
            <div className="space-y-4">
                {/* Online Status */}
                <div className="flex items-center">
                    <label className="mr-2 font-semibold">Is Online:</label>
                    <input
                        type="checkbox"
                        name="isonline"
                        checked={userProperties.isonline}
                        onChange={handleChange}
                        className="h-5 w-5"
                    />
                </div>

                {/* Friends */}
                <div>
                    <label className="block font-semibold mb-1">Friends:</label>
                    <input
                        type="text"
                        name="friends"
                        value={userProperties.friends}
                        onChange={handleChange}
                        placeholder="Enter friends (comma-separated)"
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Custom Players */}
                <div>
                    <label className="block font-semibold mb-1">
                        Custom Players:
                    </label>
                    <input
                        type="text"
                        name="customplayers"
                        value={userProperties.customplayers}
                        onChange={handleChange}
                        placeholder="Enter custom players"
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Favorite Players */}
                <div>
                    <label className="block font-semibold mb-1">
                        Favorite Players:
                    </label>
                    <input
                        type="text"
                        name="favoriteplayers"
                        value={userProperties.favoriteplayers}
                        onChange={handleChange}
                        placeholder="Enter favorite players"
                        className="w-full border rounded p-2"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={updateUserProperties}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default UserPropertiesComponent;
