import React from 'react';
import { render } from '@testing-library/react';
import FallbackState from './components/ui/FallbackState';

test('renders FallbackState component without crashing', () => {
  const { getByText } = render(
    <FallbackState
      type="empty"
      title="Test Fallback"
      message="Testing component rendering"
    />
  );
  expect(getByText('Test Fallback')).toBeInTheDocument();
  expect(getByText('Testing component rendering')).toBeInTheDocument();
});
