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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await register(username, password, password2);
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
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                                    Sign up to our platform
                                </h3>
                                <div>
                                    <div className="mb-2 block">
                                        <Label
                                            htmlFor="username"
                                            value="Your username"
                                        />
                                    </div>
                                    <TextInput
                                        ref={usernameInputRef}
                                        type="text"
                                        id="username"
                                        maxLength={20}
                                        onChange={(e) =>
                                            setUsername(e.target.value)
                                        }
                                        placeholder="Username (max 20 characters)"
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block">
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
                                        required
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 block">
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
                                <div className="mb-2 block">
                                    <Label htmlFor="email" value="Email" />
                                </div>
                                <TextInput
                                    type="email"
                                    id="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    required
                                />

                                <p className="text-red-600">
                                    {password2 !== password
                                        ? 'Passwords do not match'
                                        : ''}
                                </p>
                                <div className="w-full py-2">
                                    <Button type="submit">
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

{
    /* <section>
            <form onSubmit={handleSubmit}>
                <h1>Register</h1>
                <hr />
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                    <p>
                        {password2 !== password ? 'Passwords do not match' : ''}
                    </p>
                </div>
                <button type="submit">Register</button>
            </form>
        </section> */
}
