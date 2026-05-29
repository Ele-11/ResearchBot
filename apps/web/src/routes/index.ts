/**
 * Route Definitions
 */
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';

/**
 * Application Routes
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}