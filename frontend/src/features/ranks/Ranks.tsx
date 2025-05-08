import React, { useState, useEffect } from 'react';
import useAxios from '../../utils/useAxios';
import { useAuthStore } from '../../store/useAuthStore';
import { Button, ThemeProvider } from 'flowbite-react';
import { customTheme } from '../../utils/formThemes';
import ScrollContainer from '../../components/ui/ScrollContainer';
interface User {
    username: string;
    rankpoints: number;
}

const Ranks: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [itemsPerPage] = useState<number>(12);
    const [loading, setLoading] = useState<boolean>(true);

    const loggedInUsername = useAuthStore().user?.username;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await useAxios().get<User[]>('ranks/');
                setUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching users:', error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const getUserPageIndex = Math.floor(
            users.findIndex((user) => user.username === loggedInUsername) /
                itemsPerPage
        );
        if (getUserPageIndex > -1) {
            console.log(getUserPageIndex);
            setCurrentPage(getUserPageIndex);
        }
    }, [users]);

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
        <ThemeProvider theme={customTheme}>
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <>
                    <div className="w-full pt-2 flex items-center">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mx-auto">
                            {currentItems.map((user, index) => (
                                <ScrollContainer
                                    key={user.username}
                                    className={`text-center max-h-17 w-[200px] overflow-hidden ${
                                        user.username === loggedInUsername
                                            ? 'bg-red-500'
                                            : ''
                                    }`}
                                    headertext={
                                        <div className="flex justify-between mb-0.5">
                                            <div className="min-w-8 pb-0.5  mt-0.5 bg-amber-300/60 rounded-b-full">
                                                {index +
                                                    1 +
                                                    currentPage * itemsPerPage}
                                            </div>
                                            <div className="bg-neutral-300/70 min-h-full min-w-10 rounded-b-full pb-1 ring-1 font-bold text-slate-600 ring-blue-200 place-content-center px-3">
                                                {user.rankpoints}
                                            </div>
                                            <div className="min-w-8"></div>
                                        </div>
                                    }
                                >
                                    <p className="text-lg font-bold pt-0.5 text-slate-800">
                                        {user.username}
                                    </p>
                                </ScrollContainer>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 mx-6">
                        <Button
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            color="tennisprimary"
                        >
                            Previous
                        </Button>
                        <span className="font-semibold text-slate-700">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <Button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages - 1}
                            color="tennisprimary"
                        >
                            Next
                        </Button>
                        {/* <button
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
                        </button> */}
                    </div>
                </>
            )}
        </ThemeProvider>
    );
};

export default Ranks;
