import React, { useEffect, useState, FormEvent } from 'react';
import { AxiosInstance, AxiosError } from '../utils/axios';
import UserPropertiesComponent from '../components/UserPropertiesComponent';
import useAxios from '../utils/useAxios';

const Private: React.FC = () => {
    // Explicitly type the state variables
    const [res, setRes] = useState<string>('');
    const [posRes, setPostRes] = useState<string>('');

    // Typed axios instance from custom hook
    const api: AxiosInstance = useAxios();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get<{ response: string }>('/test/');
                setRes(response.data.response);
            } catch (error) {
                // Type-safe error handling
                if (error instanceof AxiosError) {
                    setPostRes(error.response?.data || 'An error occurred');
                } else {
                    setPostRes('An unexpected error occurred');
                }
            }
        };
        fetchData();
    }, [api]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Type assertion for the form target
        const target = e.target as HTMLFormElement;
        const inputElement = target[0] as HTMLInputElement;

        try {
            const response = await api.post<{ response: string }>('/test/', {
                text: inputElement.value,
            });
            setPostRes(response.data.response);
        } catch (error) {
            // Type-safe error handling
            if (error instanceof AxiosError) {
                setPostRes(error.response?.data || 'An error occurred');
            } else {
                setPostRes('An unexpected error occurred');
            }
        }
    };

    return (
        <>
            <section>
                <h1>Private</h1>
                <p>{res}</p>
                <form method="POST" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Enter Text" />
                    <button type="submit">Submit</button>
                </form>
                {posRes && <p>{posRes}</p>}
            </section>
            <div>
                <UserPropertiesComponent />
            </div>
        </>
    );
};

export default Private;

// Key TypeScript Improvements:
// 1. Added type-safe error handling with AxiosError
// 2. Typed API response structures
// 3. Improved type safety for axios interactions
// 4. Explicit error message handling
