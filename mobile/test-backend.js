const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8000/api';

async function testBackend() {
    console.log('Testing backend connectivity...');

    try {
        // 1. Test Health/Root (assuming there's an endpoint, or just try auth)
        console.log(`\n1. Checking Auth Endpoint (${BASE_URL}/auth/)...`);
        // We expect a 405 or 404 or 200, but connection should succeed.
        // Let's try to login with bad credentials to check connectivity.
        try {
            await axios.post(`${BASE_URL}/auth/login/`, {
                email: 'test@example.com',
                password: 'wrongpassword'
            });
        } catch (error) {
            if (error.response) {
                console.log('✅ Connected to backend!');
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error('❌ No response received. Backend might be down or not reachable.');
                console.error('   Error:', error.message);
                process.exit(1);
            } else {
                console.error('❌ Error setting up request:', error.message);
                process.exit(1);
            }
        }

        // 2. Test Registration (Dry run - we won't actually create unless we want to)
        // Just verifying the endpoint exists is enough for connectivity.

        console.log('\nBackend connectivity verified successfully.');

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testBackend();
