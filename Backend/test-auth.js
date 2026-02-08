const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
    username: 'testuser' + Date.now(),
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    confirmPassword: 'password123',
    role: 'donor'
};

console.log('=== Authentication Test Suite ===\n');

async function testRegistration() {
    try {
        console.log('1. Testing User Registration...');
        const response = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✓ Registration successful:', response.data.message);
        return true;
    } catch (error) {
        console.error('✗ Registration failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testLogin() {
    try {
        console.log('\n2. Testing User Login...');
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        console.log('✓ Login successful');
        console.log('  - Access Token received:', response.data.accessToken ? 'YES' : 'NO');
        console.log('  - Refresh Token received:', response.data.refreshToken ? 'YES' : 'NO');
        console.log('  - User data received:', response.data.user ? 'YES' : 'NO');
        console.log('  - User role:', response.data.user?.role);

        return {
            success: true,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            userId: response.data.user.id
        };
    } catch (error) {
        console.error('✗ Login failed:', error.response?.data?.message || error.message);
        return { success: false };
    }
}

async function testRefreshToken(refreshToken) {
    try {
        console.log('\n3. Testing Refresh Token...');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
            token: refreshToken
        });

        console.log('✓ Refresh token successful');
        console.log('  - New Access Token received:', response.data.accessToken ? 'YES' : 'NO');
        console.log('  - Response field name:', Object.keys(response.data).join(', '));

        return {
            success: true,
            accessToken: response.data.accessToken
        };
    } catch (error) {
        console.error('✗ Refresh token failed:', error.response?.data?.message || error.message);
        return { success: false };
    }
}

async function testProtectedRoute(accessToken) {
    try {
        console.log('\n4. Testing Protected Route...');
        const response = await axios.get(`${API_URL}/donor/profile`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        console.log('✓ Protected route access successful');
        console.log('  - Response received:', response.data ? 'YES' : 'NO');

        return true;
    } catch (error) {
        console.error('✗ Protected route failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function runTests() {
    // Test 1: Registration
    const registerSuccess = await testRegistration();
    if (!registerSuccess) {
        console.log('\n⚠ Stopping tests due to registration failure');
        return;
    }

    // Test 2: Login
    const loginResult = await testLogin();
    if (!loginResult.success) {
        console.log('\n⚠ Stopping tests due to login failure');
        return;
    }

    // Test 3: Refresh Token
    const refreshResult = await testRefreshToken(loginResult.refreshToken);
    if (!refreshResult.success) {
        console.log('\n⚠ Refresh token test failed, but continuing...');
    }

    // Test 4: Protected Route
    await testProtectedRoute(refreshResult.success ? refreshResult.accessToken : loginResult.accessToken);

    console.log('\n=== Test Suite Complete ===');
    console.log('\nNOTE: To verify refresh token storage in database,');
    console.log('check the User collection for email:', testUser.email);
}

runTests().catch(err => {
    console.error('Test suite error:', err);
    process.exit(1);
});
