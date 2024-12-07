import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '../components/ui/card';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Fetch user data from a JSON file or API
        fetch('./assets/tennis-players-data.json')
            .then((response) => response.json())
            .then((data) => setUsers(data));
    }, []);

    return (
        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>User List</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border text-left">Name</th>
                            <th className="p-2 border text-left">Email</th>
                            <th className="p-2 border text-left">Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="p-2 border">{user.name}</td>
                                <td className="p-2 border">{user.email}</td>
                                <td className="p-2 border">{user.phone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
};

export default UserList;
