import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './AdminLogin';

const renderLogin = () => render(
    <MemoryRouter initialEntries={['/admin']}>
        <Routes>
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/home" element={<div>Admin home page</div>} />
        </Routes>
    </MemoryRouter>
);

const fillAndSubmit = () => {
    userEvent.type(screen.getByLabelText('Mobile Number'), '9999999999');
    userEvent.type(screen.getByLabelText('Password'), 'secret');
    userEvent.click(screen.getByRole('button', { name: 'Login' }));
};

beforeEach(() => {
    global.fetch = jest.fn();
    window.alert = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    localStorage.clear();
    delete global.fetch;
});

test('renders labelled mobile and password fields and sets the page title', () => {
    renderLogin();

    expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    expect(document.title).toBe('Navyug Gym - Admin login');
});

test('posts the credentials, stores the token and opens the admin home on success', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 201, json: async () => ({ success: true, token: 'jwt-abc' }) });
    renderLogin();

    fillAndSubmit();

    expect(await screen.findByText('Admin home page')).toBeInTheDocument();
    expect(localStorage.getItem('gymdata')).toBe('jwt-abc');
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('http://api.test/user/login/admin');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ mobileNo: '9999999999', password: 'secret' });
});

test('alerts and stores nothing when the credentials are rejected (400)', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 400, json: async () => ({ success: false, Error: "Passwords doesn't match!" }) });
    renderLogin();

    fillAndSubmit();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Incorrect User Number or Password. Please try again.'));
    expect(localStorage.getItem('gymdata')).toBeNull();
    expect(screen.queryByText('Admin home page')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
});

test('shows the server message when a 200 reply reports failure', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: false, Error: 'Locked out' }) });
    renderLogin();

    fillAndSubmit();

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Locked out'));
    expect(localStorage.getItem('gymdata')).toBeNull();
});

test('stays on the form without crashing when the network fails', async () => {
    global.fetch.mockRejectedValue(new Error('offline'));
    renderLogin();

    fillAndSubmit();

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(localStorage.getItem('gymdata')).toBeNull();
});
