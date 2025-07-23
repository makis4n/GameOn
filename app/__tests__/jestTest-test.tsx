import { render } from '@testing-library/react-native';
import JestTest from '../jestTest';

test('renders JestTest component', () => {
  const { getByText } = render(<JestTest />);
  const textElement = getByText(/This is a test component for Jest./i);
  expect(textElement).toBeTruthy();
});