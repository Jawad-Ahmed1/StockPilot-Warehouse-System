import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import Dashboard from './pages/Dashboard'
import { authService } from './services/authService'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    const isAuth = authService.isAuthenticated()
    if (currentUser && isAuth) {
      setUser(currentUser)
      setIsAuthenticated(true)
    }
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    setCurrentPage('home')
  }

  const handleSignupSuccess = () => setCurrentPage('login')
  const handleNavigateToLogin = () => setCurrentPage('login')
  const handleNavigateToSignup = () => setCurrentPage('signup')
  const handleNavigateToHome = () => setCurrentPage('home')
  const handleNavigateToDashboard = () => setCurrentPage('dashboard')

  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToSignup={handleNavigateToSignup}
          onNavigateToAdmin={handleNavigateToDashboard}
          onNavigateToAI={handleNavigateToDashboard}
        />
      )}
      {currentPage === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignup={handleNavigateToSignup}
        />
      )}
      {currentPage === 'signup' && (
        <SignupPage
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={handleNavigateToLogin}
        />
      )}
      {currentPage === 'dashboard' && isAuthenticated && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onNavigateToHome={handleNavigateToHome}
          onUserUpdate={(updated) => setUser(updated)}
        />
      )}
    </div>
  )
}

export default App
