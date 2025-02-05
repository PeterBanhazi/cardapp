import React, { useState, useEffect } from 'react';
import useAxios from '../utils/useAxios';
import { useAuthStore } from '../store/auth';

interface User {
    username: string;
    rankpoints: number;
}

const TopList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(true);

    const loggedInUsername = useAuthStore(
        (state) => state.allUserData?.username
    );

    useEffect(() => {
        const fetchUsers = async () => {
            const api = useAxios();
            try {
                const response = await api.get<User[]>('ranks/');
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentItems = users.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Ranked Users</h1>
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {currentItems.map((user, index) => (
                            <div
                                key={user.username}
                                className={`p-4 rounded shadow text-center ${
                                    user.username === loggedInUsername
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100'
                                }`}
                            >
                                <p className="text-lg font-semibold">{`${
                                    index + 1 + currentPage * itemsPerPage
                                }. ${user.username}`}</p>
                                <p className="text-sm text-gray-600">
                                    Rank Points: {user.rankpoints}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TopList;
