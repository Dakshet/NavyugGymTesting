import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
    window.history.pushState({}, '', '/');
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
});

afterEach(() => {
    localStorage.clear();
    delete global.fetch;
});

test('the public route renders the signup form between the navbar and footer', async () => {
    render(<App />);

    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByText('Mahesh Wagh')).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('http://api.test/user/admin/visitdata', expect.anything()));
});

test('the admin login route renders the login form', () => {
    window.history.pushState({}, '', '/admin');

    render(<App />);

    expect(screen.getByLabelText('Password')).toBeInTheDocument();
});
