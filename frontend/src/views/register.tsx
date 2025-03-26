import { useEffect, useState, useRef } from 'react';
import { register } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Button, Label, Modal, TextInput } from 'flowbite-react';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
    const navigate = useNavigate();

    const [openModal, setOpenModal] = useState(true);
    const usernameInputRef = useRef(null);

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/');
        }
    }, []);

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setPassword2('');
        setEmail('');
    };

    const handleSubmit = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        const { error } = await register(username, password, password2, email);
        if (error) {
            alert(JSON.stringify(error));
        } else {
            navigate('/');
            resetForm();
        }
    };

    return (
        <>
            <div className="absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-45">
                <Modal
                    show={openModal}
                    size="md"
                    popup
                    dismissible
                    onClose={() => {
                        setOpenModal(false);
                        navigate('/');
                    }}
                    className="bg-opacity-75"
                    initialFocus={usernameInputRef}
                >
                    <Modal.Header />
                    <Modal.Body>
                        <div className="space-y-6">
                            <form onSubmit={handleSubmit}>
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
                                    Sign up to our platform
                                </h3>
                                <div>
                                    <div className="mb-1 block mt-2">
                                        <Label
                                            htmlFor="username"
                                            value="Your username"
                                        />
                                    </div>
                                    <TextInput
                                        ref={usernameInputRef}
                                        type="text"
                                        id="username"
                                        autoComplete="username"
                                        maxLength={20}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="Username (max 20 characters)"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 block mt-2">
                                        <Label
                                            htmlFor="password"
                                            value="Your password"
                                        />
                                    </div>
                                    <TextInput
                                        type="password"
                                        id="password"
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Password"
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-1 block mt-2">
                                        <Label
                                            htmlFor="confirm-password"
                                            value="Repeat password"
                                        />
                                    </div>
                                    <TextInput
                                        type="password"
                                        id="confirm-password"
                                        onChange={(e) =>
                                            setPassword2(e.target.value)
                                        }
                                        placeholder="Confirm Password"
                                        required
                                    />
                                </div>
                                <div className="mb-1 block mt-2">
                                    <Label htmlFor="email" value="Email" />
                                </div>
                                <TextInput
                                    type="email"
                                    id="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    required
                                />

                                <p className="text-red-600">
                                    {password2 !== password
                                        ? 'Passwords do not match'
                                        : ''}
                                </p>
                                <div className="w-full pt-4">
                                    <Button
                                        type="submit"
                                        className="bg-orange-400"
                                    >
                                        Create new account
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
}

export default Register;
