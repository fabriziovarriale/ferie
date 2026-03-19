import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Select from '@/Components/Select';
import Slideover from '@/Components/Slideover';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';

const ROLE_OPTIONS = [
    { id: 'user', name: 'Dipendente' },
    { id: 'admin', name: 'Admin' },
];

export default function CreateUserSlideover({ show, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => onClose?.(),
        });
    };

    return (
        <Slideover show={show} onClose={onClose} title="Nuovo utente">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="firstName" value="Nome" />
                        <TextInput
                            id="firstName"
                            value={data.firstName}
                            onChange={(e) => setData('firstName', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.firstName} className="mt-2" />
                    </div>
                    <div>
                        <InputLabel htmlFor="lastName" value="Cognome" />
                        <TextInput
                            id="lastName"
                            value={data.lastName}
                            onChange={(e) => setData('lastName', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.lastName} className="mt-2" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Conferma password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="role" value="Ruolo" />
                    <Select
                        id="role"
                        value={data.role}
                        onChange={(v) => setData('role', v)}
                        options={ROLE_OPTIONS}
                        optionValue="id"
                        optionLabel="name"
                    />
                    <InputError message={errors.role} className="mt-2" />
                </div>

                <div className="flex gap-3 pt-2">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Creazione...' : 'Crea utente'}
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={onClose}>
                        Annulla
                    </SecondaryButton>
                </div>
            </form>
        </Slideover>
    );
}
