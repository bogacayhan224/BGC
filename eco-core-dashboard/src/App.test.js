import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Eco Core Dashboard heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Eco Core Dashboard/i);
  expect(headingElement).toBeInTheDocument();
}); 