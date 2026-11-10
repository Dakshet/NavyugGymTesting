import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminPannel from './AdminPannel';
import GymContext from '../context/Gym/GymContext';

const fetchFeesPendingData = jest.fn();
const setPendingData = jest.fn();
const aceeptMemberRequest = jest.fn();
const deleteMemberRequest = jest.fn();

const row = (id, name) => [name, `${name}@example.com`, '9000000001', 'Byculla Mumbai Maharashtra India', id, '05-11-2026'];

const renderPanel = (pendingData) => render(
    <GymContext.Provider value={{ pendingData, setPendingData, fetchFeesPendingData, aceeptMemberRequest, deleteMemberRequest }}>
        <MemoryRouter initialEntries={['/admin/add/panel']}>
            <Routes>
                <Route path="/admin/add/panel" element={<AdminPannel />} />
                <Route path="/admin" element={<div>Login page</div>} />
            </Routes>
        </MemoryRouter>
    </GymContext.Provider>
);

beforeEach(() => {
    [fetchFeesPendingData, setPendingData, aceeptMemberRequest, deleteMemberRequest].forEach((fn) => fn.mockReset());
    localStorage.setItem('gymdata', 'token-123');
});

afterEach(() => localStorage.clear());

test('redirects to the login page without fetching when there is no token', async () => {
    localStorage.clear();

    renderPanel([]);

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(fetchFeesPendingData).not.toHaveBeenCalled();
});

test('fetches the pending applications once when a token exists and shows the loader meanwhile', () => {
    renderPanel([]);

    expect(fetchFeesPendingData).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Navyug Gym')).toBeInTheDocument();
    expect(screen.queryByText(/New Applications/)).not.toBeInTheDocument();
    expect(document.title).toBe('Navyug Gym - New Application Requests');
});

test('sentinel 1 shows the up-to-date message with a zero count', () => {
    renderPanel(1);

    expect(screen.getByText('New Applications (0)')).toBeInTheDocument();
    expect(screen.getByText("You're up to date! No new requests.")).toBeInTheDocument();
});

test('sentinel 0 (expired token) redirects to login and resets the list state', async () => {
    renderPanel(0);

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(setPendingData).toHaveBeenCalledWith(1);
});

test('lists every pending application with its count', () => {
    renderPanel([row('a', 'rahul'), row('b', 'priya')]);

    expect(screen.getByText('New Applications (2)')).toBeInTheDocument();
    expect(screen.getByText('Name: RAHUL')).toBeInTheDocument();
    expect(screen.getByText('Name: PRIYA')).toBeInTheDocument();
});

test('approving submits the member id with the chosen amount and paid status', async () => {
    renderPanel([row('file-a', 'rahul')]);

    userEvent.selectOptions(screen.getByLabelText('Amount'), '6000');
    userEvent.selectOptions(screen.getByLabelText('Paid Status:'), 'Yes');
    userEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(aceeptMemberRequest).toHaveBeenCalledWith('file-a', '6000', 'Yes'));
});

test('Delete removes the member by its file id', () => {
    renderPanel([row('file-a', 'rahul')]);

    userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(deleteMemberRequest).toHaveBeenCalledWith('file-a');
});
