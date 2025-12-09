import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Here you would typically validate the credentials and authenticate the user
  // For demonstration purposes, we'll assume a simple check
  if (email === 'user@example.com' && password === 'password') {
    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } else {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }
}
