import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import RouteLoader from './components/RouteLoader'
import Courses from './pages/Courses'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

const App = () => {
  return (
    <BrowserRouter>
      <RouteLoader>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path='*' element={<NotFound/>} />
        </Routes>
      </RouteLoader>
    </BrowserRouter>
  )
}

export default App