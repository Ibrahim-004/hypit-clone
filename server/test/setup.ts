process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://hypit:hypit@localhost:5432/hypit';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long';
process.env.CLIENT_URL = 'http://localhost:5173';
