import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { onSnapshot, collection, query, where, or } from 'firebase/firestore';
import { auth } from '@/Firebase-config';
import ChatList from '../(tabs)/chat';

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  or: jest.fn(),
  onSnapshot: jest.fn(),
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
}));

interface MockConversation {
  _id: string;
  u1: { _id: string; email: string };
  u2: { _id: string; email: string };
  messages: Array<{ text: string; createdAt: string }>;
}

interface MockSnapshot {
  forEach: (fn: (doc: { data: () => MockConversation }) => void) => void;
}

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 44 }),
}));

jest.mock('react-native-paper', () => ({
  Text: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
  Button: ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID="start-conversation-btn">
        <Text>{children}</Text>
      </TouchableOpacity>
    );
  },
}));

jest.mock('@expo/vector-icons', () => ({
  FontAwesome: () => {
    const { View } = require('react-native');
    return <View testID="fab-icon" />;
  },
}));

describe('ChatList', () => {
  const mockConversations: MockConversation[] = [
    {
      _id: 'conv1',
      u1: { _id: 'test-user-id', email: 'user1@example.com' },
      u2: { _id: 'other-user-id', email: 'user2@example.com' },
      messages: [{ text: 'Hello!', createdAt: '2024-01-15T10:30:00Z' }],
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = { uid: 'test-user-id' };
    
    (collection as jest.Mock).mockReturnValue('mock-collection');
    (where as jest.Mock).mockReturnValue('mock-where');
    (or as jest.Mock).mockReturnValue('mock-or');
    (query as jest.Mock).mockReturnValue('mock-query');
 
    (onSnapshot as jest.Mock).mockImplementation((q: any, callback: (snapshot: MockSnapshot) => void) => {
      const mockSnapshot: MockSnapshot = {
        forEach: (fn) => mockConversations.forEach(conv => fn({ data: () => conv }))
      };
      callback(mockSnapshot);
      return jest.fn();
    });
  });

  it('shows empty state when no conversations', () => {
    (onSnapshot as jest.Mock).mockImplementation((q: any, callback: (snapshot: MockSnapshot) => void) => {
      callback({ forEach: () => {} });
      return jest.fn();
    });

    const { getByText } = render(<ChatList />);
    expect(getByText('You have no messages')).toBeTruthy();
    expect(getByText('Start a Conversation')).toBeTruthy();
  });

  it('navigates to chat search when empty state button pressed', () => {
    (onSnapshot as jest.Mock).mockImplementation((q: any, callback: (snapshot: MockSnapshot) => void) => {
      callback({ forEach: () => {} });
      return jest.fn();
    });

    const { getByTestId } = render(<ChatList />);
    fireEvent.press(getByTestId('start-conversation-btn'));
    expect(router.push).toHaveBeenCalledWith('/chatFolder/chatSearch');
  });
});