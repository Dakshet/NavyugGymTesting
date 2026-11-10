import React, { useContext } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import GymContext from './GymContext';
import GymState from './GymState';

const HOST = 'http://api.test';

// Exposes the context to the test so each action can be called and its state inspected.
let ctx;
const Probe = () => {
    ctx = useContext(GymContext);
    return (
        <>
            <div data-testid="pending">{JSON.stringify(ctx.pendingData)}</div>
            <div data-testid="membership">{JSON.stringify(ctx.membershipData)}</div>
            <div data-testid="home">{JSON.stringify(ctx.homeAdminData)}</div>
            <div data-testid="search">{JSON.stringify(ctx.searchUser)}</div>
            <div data-testid="subscription">{JSON.stringify(ctx.subscriptionEnd)}</div>
            <div data-testid="monthwise">{JSON.stringify(ctx.monthwiseData)}</div>
            <div data-testid="image">{JSON.stringify(ctx.imageBase64)}</div>
            <div data-testid="days">{JSON.stringify(ctx.fetchDays)}</div>
        </>
    );
};

const renderState = () => render(<GymState><Probe /></GymState>);
const shown = (id) => JSON.parse(screen.getByTestId(id).textContent);

const reply = (body, { ok = true, status = 200 } = {}) => Promise.resolve({ ok, status, statusText: '', json: async () => body });

const member = (id, name = 'rahul') => [name, 'a@b.c', '900', 'addr', id, '01-11-2026'];

beforeEach(() => {
    localStorage.setItem('gymdata', 'token-123');
    global.fetch = jest.fn();
    window.alert = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    localStorage.clear();
    delete global.fetch;
});

// Every list loader follows the same sentinel contract: data -> rows, [] -> 1, 400 -> 0, other failure -> [].
describe.each([
    ['fetchFeesPendingData', 'pending', '/user/admin/feespending'],
    ['fetchMembershipStatusUserData', 'membership', '/user/admin/feesdeadline'],
    ['fetchHomeAdminData', 'home', '/user/admin/homedata'],
    ['fetchSubscriptionEndUserData', 'subscription', '/user/admin/feesend'],
])('%s', (action, testId, path) => {
    test('calls the endpoint with the stored auth token', async () => {
        global.fetch.mockReturnValue(reply({ success: true, Data: [member('a')] }));
        renderState();

        await act(async () => { await ctx[action](); });

        expect(global.fetch).toHaveBeenCalledWith(`${HOST}${path}`, expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({ auth_token: 'token-123' }),
        }));
    });

    test('stores the rows when the server returns data', async () => {
        global.fetch.mockReturnValue(reply({ success: true, Data: [member('a')] }));
        renderState();

        await act(async () => { await ctx[action](); });

        expect(shown(testId)).toEqual([member('a')]);
    });

    test('uses the sentinel 1 when the list is empty', async () => {
        global.fetch.mockReturnValue(reply({ success: true, Data: [] }));
        renderState();

        await act(async () => { await ctx[action](); });

        expect(shown(testId)).toBe(1);
    });

    test('uses the sentinel 0, alerts and clears the token on a 400 (expired token)', async () => {
        global.fetch.mockReturnValue(reply({}, { ok: false, status: 400 }));
        renderState();

        await act(async () => { await ctx[action](); });

        expect(shown(testId)).toBe(0);
        expect(window.alert).toHaveBeenCalledWith('Expired token. Please log in again.');
        expect(localStorage.getItem('gymdata')).toBeNull();
    });

    test('falls back to [] (loader) on a server error and keeps the token', async () => {
        global.fetch.mockReturnValue(reply({}, { ok: false, status: 500 }));
        renderState();

        await act(async () => { await ctx[action](); });

        expect(shown(testId)).toEqual([]);
        expect(localStorage.getItem('gymdata')).toBe('token-123');
    });

    test('falls back to [] on a network error', async () => {
        global.fetch.mockRejectedValue(new Error('offline'));
        renderState();

        await act(async () => { await ctx[action](); });

        expect(shown(testId)).toEqual([]);
    });
});

describe('fetchDataMonthWise', () => {
    test('requests the given month and applies the sentinels', async () => {
        global.fetch.mockReturnValueOnce(reply({ Data: [member('a')] })).mockReturnValueOnce(reply({ Data: [] }));
        renderState();

        await act(async () => { await ctx.fetchDataMonthWise(11); });
        expect(global.fetch.mock.calls[0][0]).toBe(`${HOST}/user/admin/fetchmonthwise/11`);
        expect(shown('monthwise')).toEqual([member('a')]);

        await act(async () => { await ctx.fetchDataMonthWise(3); });
        expect(shown('monthwise')).toBe(1);
    });

    test('uses 0 on an expired token', async () => {
        global.fetch.mockReturnValue(reply({}, { ok: false, status: 400 }));
        renderState();

        await act(async () => { await ctx.fetchDataMonthWise(11); });

        expect(shown('monthwise')).toBe(0);
        expect(localStorage.getItem('gymdata')).toBeNull();
    });
});

describe('fetchSearchUser', () => {
    test('sends the search text and stores matching members', async () => {
        global.fetch.mockReturnValue(reply({ success: true, Data: [member('a')] }));
        renderState();

        await act(async () => { await ctx.fetchSearchUser('rahul'); });

        expect(global.fetch.mock.calls[0][0]).toBe(`${HOST}/user/admin/search/?name=rahul`);
        expect(shown('search')).toEqual([member('a')]);
    });

    test('maps the "User is not found!" reply to the empty sentinel 1', async () => {
        global.fetch.mockReturnValue(reply({ success: true, Data: 'User is not found!' }));
        renderState();

        await act(async () => { await ctx.fetchSearchUser('nobody'); });

        expect(shown('search')).toBe(1);
    });

    test('uses 0 on an expired token', async () => {
        global.fetch.mockReturnValue(reply({}, { ok: false, status: 400 }));
        renderState();

        await act(async () => { await ctx.fetchSearchUser('x'); });

        expect(shown('search')).toBe(0);
    });
});

describe('aceeptMemberRequest / deleteMemberRequest', () => {
    const loadTwoPending = async () => {
        global.fetch.mockReturnValueOnce(reply({ Data: [member('a'), member('b')] }));
        renderState();
        await act(async () => { await ctx.fetchFeesPendingData(); });
        global.fetch.mockClear();
    };

    test('accept removes the member from the list immediately and sends the amount', async () => {
        await loadTwoPending();
        global.fetch.mockReturnValue(reply({ success: true, Data: 'Successfully Add Member' }));

        await act(async () => { await ctx.aceeptMemberRequest('a', '3000', 'Yes'); });

        expect(global.fetch).toHaveBeenCalledWith(`${HOST}/user/admin/feesaccept/a`, expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ amount: '3000' }),
        }));
        expect(shown('pending').map((row) => row[4])).toEqual(['b']);
        expect(window.alert).toHaveBeenCalledWith('Successfully Add Member');
    });

    test('accepting the last member switches to the empty sentinel 1', async () => {
        global.fetch.mockReturnValueOnce(reply({ Data: [member('a')] }));
        renderState();
        await act(async () => { await ctx.fetchFeesPendingData(); });
        global.fetch.mockReturnValue(reply({ success: true, Data: 'ok' }));

        await act(async () => { await ctx.aceeptMemberRequest('a', '3000', 'Yes'); });

        expect(shown('pending')).toBe(1);
    });

    test('accept forces the expired-token flow on a 400', async () => {
        await loadTwoPending();
        global.fetch.mockReturnValue(reply({}, { ok: false, status: 400 }));

        await act(async () => { await ctx.aceeptMemberRequest('a', '3000', 'Yes'); });

        expect(shown('pending')).toBe(0);
        expect(localStorage.getItem('gymdata')).toBeNull();
    });

    test('delete removes the member, calls DELETE and confirms', async () => {
        await loadTwoPending();
        global.fetch.mockReturnValue(reply({ success: true, Data: {} }));

        await act(async () => { await ctx.deleteMemberRequest('b'); });

        expect(global.fetch).toHaveBeenCalledWith(`${HOST}/user/admin/deletedata/b`, expect.objectContaining({ method: 'DELETE' }));
        expect(shown('pending').map((row) => row[4])).toEqual(['a']);
        expect(window.alert).toHaveBeenCalledWith('Deleted successfully!');
    });

    test('delete forces the expired-token flow on a 400', async () => {
        await loadTwoPending();
        global.fetch.mockReturnValue(reply({}, { ok: false, status: 400 }));

        await act(async () => { await ctx.deleteMemberRequest('b'); });

        expect(shown('pending')).toBe(0);
    });
});

describe('fetchUserImage', () => {
    test('stores the base64 image link', async () => {
        global.fetch.mockReturnValue(reply({ success: true, imageLink: 'data:image/jpeg;base64,AAA' }));
        renderState();

        await act(async () => { await ctx.fetchUserImage('abc'); });

        expect(global.fetch.mock.calls[0][0]).toBe(`${HOST}/user/admin/fetchimage/abc`);
        expect(shown('image')).toBe('data:image/jpeg;base64,AAA');
    });

    test('clears the image when the server reports failure', async () => {
        global.fetch.mockReturnValue(reply({ success: false, Error: 'nope' }));
        renderState();

        await act(async () => { await ctx.fetchUserImage('abc'); });

        expect(shown('image')).toBe('');
    });
});

describe('fetchDaysForSubscriptionEnd', () => {
    test('stores the configured days', async () => {
        global.fetch.mockReturnValue(reply({ success: true, Data: '30' }));
        renderState();

        await act(async () => { await ctx.fetchDaysForSubscriptionEnd(); });

        expect(shown('days')).toBe('30');
    });

    test('falls back to "0" on failure', async () => {
        global.fetch.mockReturnValue(reply({}, { ok: false, status: 500 }));
        renderState();

        await act(async () => { await ctx.fetchDaysForSubscriptionEnd(); });

        await waitFor(() => expect(shown('days')).toBe('0'));
    });
});

describe('countWebVisit', () => {
    test('pings the public visit endpoint without an auth token', async () => {
        global.fetch.mockReturnValue(reply({ success: true }));
        renderState();

        await act(async () => { await ctx.countWebVisit(); });

        expect(global.fetch).toHaveBeenCalledWith(`${HOST}/user/admin/visitdata`, expect.objectContaining({ method: 'GET' }));
        expect(global.fetch.mock.calls[0][1].headers.auth_token).toBeUndefined();
    });

    test('swallows network errors', async () => {
        global.fetch.mockRejectedValue(new Error('offline'));
        renderState();

        await expect(act(async () => { await ctx.countWebVisit(); })).resolves.not.toThrow();
    });
});
