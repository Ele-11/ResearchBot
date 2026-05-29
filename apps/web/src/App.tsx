/**
 * App Root Component
 */
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes';

/**
 * Application Root Component
 * Sets up routing and global providers
 */
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;