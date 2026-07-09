import { setupGlobalFetchInterceptor } from './utils/apiClient';
setupGlobalFetchInterceptor();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
const App = () => <div>App</div>;
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);