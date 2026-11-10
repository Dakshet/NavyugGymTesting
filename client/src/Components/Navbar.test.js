import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import GymContext from '../context/Gym/GymContext';

const fetchSearchUser = jest.fn();

const renderNavbar = (path = '/') => render(
    <GymContext.Provider value={{ fetchSearchUser }}>
        <MemoryRouter initialEntries={[path]}>
            <Navbar />
            <Routes>
                <Route path="/admin" element={<div>Login page</div>} />
                <Route path="/admin/search/result" element={<div>Search results page</div>} />
                <Route path="*" element={<div>Other page</div>} />
            </Routes>
        </MemoryRouter>
    </GymContext.Provider>
);

beforeEach(() => fetchSearchUser.mockReset());
afterEach(() => localStorage.clear());

describe('Navbar', () => {
    test('logged out: offers Admin and hides the admin navigation', () => {
        renderNavbar('/');

        expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /membership requests/i })).toHaveClass('hideBtn');
    });

    test('logged in: shows the admin navigation and Logout', () => {
        localStorage.setItem('gymdata', 'token-123');

        renderNavbar('/admin/home');

        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /membership requests/i })).not.toHaveClass('hideBtn');
        expect(screen.getByRole('link', { name: /members data/i })).toHaveAttribute('href', '/admin/membership/data');
    });

    test('Logout clears the token and returns to the login page', () => {
        localStorage.setItem('gymdata', 'token-123');
        renderNavbar('/admin/home');

        userEvent.click(screen.getByRole('button', { name: 'Logout' }));

        expect(localStorage.getItem('gymdata')).toBeNull();
        expect(screen.getByText('Login page')).toBeInTheDocument();
    });

    test('searching runs the query and opens the results page', () => {
        localStorage.setItem('gymdata', 'token-123');
        renderNavbar('/admin/home');

        userEvent.type(screen.getByPlaceholderText('Search name, surname, mobile number'), 'rahul{enter}');

        expect(fetchSearchUser).toHaveBeenCalledWith('rahul');
        expect(screen.getByText('Search results page')).toBeInTheDocument();
    });
});

describe('Footer', () => {
    test('shows the gym contacts and address', () => {
        render(<Footer />);

        expect(screen.getByText('Mahesh Wagh')).toBeInTheDocument();
        expect(screen.getByText('+91 8291616435')).toBeInTheDocument();
        expect(screen.getByText(/J J Hospital Compound/)).toBeInTheDocument();
    });
});
