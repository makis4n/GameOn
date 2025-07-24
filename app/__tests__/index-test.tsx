import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '@/app/index';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { router } from 'expo-router';

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Login />);
    
    expect(getByText('Welcome to GameOn')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
  });

  it('updates email and password fields', () => {
    const { getByPlaceholderText } = render(<Login />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    expect(emailInput.props.value).toBe('test@example.com');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('handles successful login with verified email and existing profile', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: {
        uid: 'test-uid',
        emailVerified: true,
      },
    });
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => true,
    });

    const { getByPlaceholderText, getByText } = render(<Login />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
      expect(getDoc).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/home');
    });
  });

  it('handles successful login with verified email but no profile', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: {
        uid: 'test-uid',
        emailVerified: true,
      },
    });
    (getDoc as jest.Mock).mockResolvedValueOnce({
      exists: () => false,
    });

    const { getByPlaceholderText, getByText } = render(<Login />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
      expect(getDoc).toHaveBeenCalled();
      expect(router.replace).toHaveBeenCalledWith('/createProfile');
    });
  });

  it('shows alert when email is not verified', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
      user: {
        uid: 'test-uid',
        emailVerified: false,
      },
    });

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(<Login />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Please verify your email before logging in.');
    });
    alertMock.mockRestore();
  });

  it('handles login failure', async () => {
    const error = new Error('Invalid credentials');
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(error);

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const { getByPlaceholderText, getByText } = render(<Login />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Sign in failed: Invalid credentials');
    });
    alertMock.mockRestore();
  });

  it('navigates to create account screen', () => {
    const { getByText } = render(<Login />);
    fireEvent.press(getByText('Create Account'));
    expect(router.push).toHaveBeenCalledWith('/createAccount');
  });
});