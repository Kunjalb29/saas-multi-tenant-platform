import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes';

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#e2e8f0' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#e2e8f0' },
          },
          duration: 3500,
        }}
      />
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
