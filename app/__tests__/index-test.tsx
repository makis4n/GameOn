import { render } from '@testing-library/react-native';
import Login from '../index';

test('renders login component', () => {
  const { getByText } = render(<Login />);
  const textElement = getByText('Welcome to GameOn');
  expect(textElement).toBeTruthy();
});