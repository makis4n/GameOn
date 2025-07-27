import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TeamPage from '../homeFolder/createTeam';
import { auth, db } from '@/Firebase-config';

const mockGetDocs = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockCollection = jest.fn(() => 'mock-collection');
const mockDoc = jest.fn(() => 'mock-doc');
const mockQuery = jest.fn(() => 'mock-query');
const mockWhere = jest.fn(() => 'mock-where');

jest.mock('firebase/firestore', () => ({
  collection: mockCollection,
  doc: mockDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  where: mockWhere,
}));

jest.mock('@/Firebase-config', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-123',
    },
  },
  db: {},
}));


jest.spyOn(Alert, 'alert');

describe('TeamPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as any).currentUser = {
      uid: 'test-user-123',
    };
    
    mockGetDocs.mockReset();
    mockSetDoc.mockReset();
    mockUpdateDoc.mockReset();
    mockCollection.mockReturnValue('mock-collection');
    mockDoc.mockReturnValue('mock-doc');
    mockQuery.mockReturnValue('mock-query');
    mockWhere.mockReturnValue('mock-where');
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<TeamPage />);
    
    expect(getByText('Create or Join a Team')).toBeTruthy();
    expect(getByPlaceholderText('Enter Team Name')).toBeTruthy();
    expect(getByText('Create Team')).toBeTruthy();
    expect(getByText('Join Team')).toBeTruthy();
  });

  it('updates team name input correctly', () => {
    const { getByPlaceholderText } = render(<TeamPage />);
    const input = getByPlaceholderText('Enter Team Name');
    
    fireEvent.changeText(input, 'Test Team');
    expect(input.props.value).toBe('Test Team');
  });

  describe('Create Team Functionality', () => {
    it('shows error when team name is empty', async () => {
      const { getByText } = render(<TeamPage />);
      const createButton = getByText('Create Team');
      
      fireEvent.press(createButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Missing team name or user.'
        );
      });
    });

    it('handles create team error', async () => {
      mockGetDocs.mockResolvedValue({
        empty: true,
        docs: [],
      });

      mockSetDoc.mockRejectedValue(new Error('Firestore error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText, getByPlaceholderText } = render(<TeamPage />);
      
      const input = getByPlaceholderText('Enter Team Name');
      const createButton = getByText('Create Team');
      
      fireEvent.changeText(input, 'Test Team');
      fireEvent.press(createButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to create team.'
        );
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Join Team Functionality', () => {
    it('shows error when team name is empty', async () => {
      const { getByText } = render(<TeamPage />);
      const joinButton = getByText('Join Team');
      
      fireEvent.press(joinButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Missing team name or user.'
        );
      });
    });

    it('handles join team error', async () => {
      mockGetDocs.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: 'team-id',
          data: () => ({
            name: 'Test Team',
            members: ['other-user'],
          }),
        }],
      } as any);

      mockUpdateDoc.mockRejectedValueOnce(new Error('Firestore error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText, getByPlaceholderText } = render(<TeamPage />);
      
      const input = getByPlaceholderText('Enter Team Name');
      const joinButton = getByText('Join Team');
      
      fireEvent.changeText(input, 'Test Team');
      fireEvent.press(joinButton);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to join team.'
        );
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

});