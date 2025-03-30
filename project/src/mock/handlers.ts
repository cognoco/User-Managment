import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/profile', () => {
    return HttpResponse.json({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Software developer',
      location: 'New York',
      website: 'https://example.com',
      avatarUrl: null,
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),
  
  http.put('/api/profile', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(body);
  }),
  
  http.post('/api/profile/avatar', () => {
    return HttpResponse.json({ avatarUrl: 'https://example.com/avatar.jpg' });
  }),
  
  http.delete('/api/profile/avatar', () => {
    return HttpResponse.json({ success: true });
  }),
];
