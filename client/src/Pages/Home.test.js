import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import GymContext from '../context/Gym/GymContext';

const countWebVisit = jest.fn();

const renderHome = () => render(
    <GymContext.Provider value={{ countWebVisit }}>
        <MemoryRouter initialEntries={['/']}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/user/home" element={<div>Waiting page</div>} />
            </Routes>
        </MemoryRouter>
    </GymContext.Provider>
);

// The photo input is hidden behind a clickable box and has no label.
const photoInput = () => document.querySelector('#uPhoto');

const jpeg = (name = 'me.jpg', size = 1024) => {
    const file = new File(['x'], name, { type: 'image/jpeg' });
    Object.defineProperty(file, 'size', { value: size });
    return file;
};

// Fills every field the way a user would; the browser (not jsdom) enforces `required`.
const fillValidForm = () => {
    userEvent.upload(photoInput(), jpeg());
    userEvent.type(screen.getByLabelText('Full Name'), 'Rahul Sharma');
    userEvent.type(screen.getByLabelText('Email'), 'rahul@example.com');
    userEvent.type(screen.getByLabelText('Mobile Number'), '9000000001');
    userEvent.type(screen.getByLabelText('Address'), 'Mumbai');
    fireEvent.change(screen.getByLabelText('Date Of Birth'), { target: { value: '2000-01-01' } });
    userEvent.type(screen.getByLabelText('AGE'), '26');
    userEvent.selectOptions(screen.getByLabelText('Blood Group'), 'O+');
    userEvent.selectOptions(screen.getByLabelText('Workout Time'), 'Morning');
    userEvent.click(screen.getByRole('checkbox'));
};

beforeEach(() => {
    countWebVisit.mockReset();
    global.fetch = jest.fn();
    window.alert = jest.fn();
    global.URL.createObjectURL = jest.fn(() => 'blob:preview');
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    delete global.fetch;
});

describe('signup form', () => {
    test('renders every field and records a web visit once', () => {
        renderHome();

        ['Full Name', 'Email', 'Mobile Number', 'Address', 'Date Of Birth', 'AGE', 'Blood Group', 'Workout Time'].forEach((label) => {
            expect(screen.getByLabelText(label)).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
        expect(document.title).toBe('Navyug Gym - Login Form');
        expect(countWebVisit).toHaveBeenCalledTimes(1);
    });

    test('normalises the mobile number: strips spaces and +91, keeps the last 10 digits', () => {
        renderHome();
        const mobile = screen.getByLabelText('Mobile Number');

        userEvent.type(mobile, '+91 98765 43210');

        expect(mobile).toHaveValue('9876543210');
    });

    test('asks for a custom blood group when "Other" is selected', () => {
        renderHome();

        userEvent.selectOptions(screen.getByLabelText('Blood Group'), 'other');

        expect(screen.getByPlaceholderText('Enter your blood group')).toBeInTheDocument();
    });

    test('rejects a non-JPEG photo with an alert', () => {
        renderHome();
        const png = new File(['x'], 'me.png', { type: 'image/png' });

        userEvent.upload(photoInput(), png);

        expect(window.alert).toHaveBeenCalledWith('Please upload an image in JPG or JPEG format.');
        expect(screen.getByText('Upload your image')).toBeInTheDocument();
    });

    test('rejects a photo over 5 MB with an alert', () => {
        renderHome();

        userEvent.upload(photoInput(), jpeg('big.jpg', 6 * 1024 * 1024));

        expect(window.alert).toHaveBeenCalledWith('File size should not exceed 5 MB.');
    });

    test('submits the multipart form and moves to the waiting page on success', async () => {
        global.fetch.mockResolvedValue({ json: async () => ({ success: true }) });
        renderHome();

        fillValidForm();
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        expect(await screen.findByText('Waiting page')).toBeInTheDocument();
        const [url, options] = global.fetch.mock.calls[0];
        expect(url).toBe('http://api.test/user/signup');
        expect(options.method).toBe('POST');
        expect(options.body).toBeInstanceOf(FormData);
        expect(options.body.get('fName')).toBe('Rahul Sharma');
        expect(options.body.get('email')).toBe('rahul@example.com');
        expect(options.body.get('mobileNo')).toBe('9000000001');
        expect(options.body.get('bloodGroup')).toBe('O+');
        expect(options.body.get('workoutTime')).toBe('Morning');
        expect(options.body.get('uPhoto')).toBeInstanceOf(File);
    });

    test('shows the server error and stays on the form when signup fails', async () => {
        global.fetch.mockResolvedValue({ json: async () => ({ success: false, Error: 'Internal Serval Error Occured!' }) });
        renderHome();

        fillValidForm();
        userEvent.click(screen.getByRole('button', { name: 'Submit' }));

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Internal Serval Error Occured!'));
        expect(screen.queryByText('Waiting page')).not.toBeInTheDocument();
        expect(screen.getByText('Upload your image')).toBeInTheDocument();
    });
});
