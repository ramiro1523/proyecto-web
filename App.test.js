// src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const title = screen.getByText(/Plataforma de Denuncia Ciudadana/i);
  expect(title).toBeInTheDocument();
});
