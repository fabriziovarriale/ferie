import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Top navbar */}
            <nav className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left: hamburger (mobile) + logo + desktop links */}
                        <div className="flex items-center gap-3">
                            {/* Hamburger — mobile only */}
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(true)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none sm:hidden"
                                aria-label="Apri menu"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Logo */}
                            <Link href="/" className="flex shrink-0 items-center">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-foreground" />
                            </Link>

                            {/* Desktop nav links */}
                            <div className="hidden space-x-8 sm:ms-6 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                {user?.role === 'admin' && (
                                    <>
                                        <NavLink href={route('admin.users.index')} active={route().current('admin.users.index')}>
                                            Utenti
                                        </NavLink>
                                        <NavLink href={route('admin.holidays.index')} active={route().current('admin.holidays.index')}>
                                            Festività
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right: user dropdown (desktop) */}
                        <div className="hidden sm:flex sm:items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center rounded-md border border-transparent bg-card px-3 py-2 text-sm font-medium leading-4 text-muted-foreground transition hover:text-foreground focus:outline-none"
                                        >
                                            {user.name}
                                            <svg className="-me-0.5 ms-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </span>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>Profilo</Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Esci
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile drawer */}
            <Transition show={drawerOpen}>
                <Dialog as="div" className="relative z-50 sm:hidden" onClose={setDrawerOpen}>
                    {/* Backdrop */}
                    <TransitionChild
                        enter="ease-out duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50" />
                    </TransitionChild>

                    {/* Drawer panel */}
                    <TransitionChild
                        enter="transform transition ease-in-out duration-250"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transform transition ease-in-out duration-200"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <DialogPanel className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card shadow-xl">
                            {/* Header drawer */}
                            <div className="flex h-16 items-center justify-between border-b border-border px-4">
                                <Link href="/" onClick={() => setDrawerOpen(false)}>
                                    <ApplicationLogo className="h-8 w-auto fill-current text-foreground" />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setDrawerOpen(false)}
                                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                    aria-label="Chiudi menu"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            {/* Nav links */}
                            <nav className="flex-1 overflow-y-auto px-2 py-4">
                                <DrawerLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Dashboard
                                </DrawerLink>

                                {user?.role === 'admin' && (
                                    <>
                                        <DrawerLink
                                            href={route('admin.users.index')}
                                            active={route().current('admin.users.index')}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Utenti
                                        </DrawerLink>
                                        <DrawerLink
                                            href={route('admin.holidays.index')}
                                            active={route().current('admin.holidays.index')}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Festività
                                        </DrawerLink>
                                    </>
                                )}
                            </nav>

                            {/* User section */}
                            <div className="border-t border-border px-4 py-4">
                                <p className="text-sm font-medium text-foreground">{user.name}</p>
                                <p className="mb-3 truncate text-xs text-muted-foreground">{user.email}</p>
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href={route('profile.edit')}
                                        onClick={() => setDrawerOpen(false)}
                                        className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                                    >
                                        Profilo
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        onClick={() => setDrawerOpen(false)}
                                        className="rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                                    >
                                        Esci
                                    </Link>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </Dialog>
            </Transition>

            {header && (
                <header className="border-b border-border bg-card shadow">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}

function DrawerLink({ href, active, onClick, children }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
        >
            {children}
        </Link>
    );
}
