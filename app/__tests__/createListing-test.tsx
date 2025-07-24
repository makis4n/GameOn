import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ListingOptions from '../(tabs)/createListing';
import { router } from 'expo-router';

describe('ListingOptions Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly with all elements', () => {
    const { getByText, getAllByTestId } = render(<ListingOptions />);
    
    expect(getByText('Create a Listing')).toBeTruthy();
    expect(getByText('Create Game')).toBeTruthy();
    expect(getByText('Looking for Players')).toBeTruthy();
  });

  it('navigates to game listing when "Create Game" button is pressed', () => {
    const { getByText } = render(<ListingOptions />);
    
    fireEvent.press(getByText('Create Game'));
    
    expect(router.push).toHaveBeenCalledWith('/listings/gameListing');
  });

  it('navigates to player listing when "Looking for Players" button is pressed', () => {
    const { getByText } = render(<ListingOptions />);
    
    fireEvent.press(getByText('Looking for Players'));
    
    expect(router.push).toHaveBeenCalledWith('/listings/playerListing');
  });
});