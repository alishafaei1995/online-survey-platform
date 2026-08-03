import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import SurveyList from './pages/SurveyList';
import SurveyBuilder from './pages/SurveyBuilder';
import SurveyReport from './pages/SurveyReport';
import SurveyShare from './pages/SurveyShare';
import PublicSurvey from './pages/PublicSurvey';
import UserManagement from './pages/UserManagement';
import Participants from './pages/Participants';
import AssessmentModelPicker from './pages/AssessmentModelPicker';
import ChangePassword from './pages/ChangePassword';
import SystemInfo from './pages/SystemInfo';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/s/:id" element={<PublicSurvey />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<SurveyList />} />
            <Route path="/surveys/new" element={<SurveyBuilder />} />
            <Route path="/surveys/new/from-model" element={<AssessmentModelPicker />} />
            <Route path="/surveys/:id" element={<SurveyBuilder />} />
            <Route path="/surveys/:id/report" element={<SurveyReport />} />
            <Route path="/surveys/:id/share" element={<SurveyShare />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/account/password" element={<ChangePassword />} />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              }
            />
            <Route
              path="/system-info"
              element={
                <AdminRoute>
                  <SystemInfo />
                </AdminRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
