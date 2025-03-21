import React, { useEffect } from 'react'
import {Routes,Route, Navigate} from 'react-router-dom'
import Navbar from './components/Navbar'
import SingUpPage from './pages/SingUpPage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import { useAuthStore } from './store/useAuthSrore'
import {Loader} from 'lucide-react'
import ProfilePage from './pages/ProfilePage'
import {Toaster} from 'react-hot-toast'
import HomePage from './pages/HomePage'
import { useThemeStore } from './store/useThemeStore'

const App = () => {
  const {authUser,checkAuth,isCheckingAuth}=useAuthStore();
  const {theme}=useThemeStore();

  useEffect(()=>{
    checkAuth();
  },[checkAuth])

  if(isCheckingAuth && !authUser){
    return (
      <div className='flex justify-center items-center h-screen'>
        <Loader className='size-10 animate-spin'/>
      </div>
    )
  }

  return (
    <div data-theme={theme}>
      
      <Navbar />

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to='/login'/>} />
        <Route path="/signup" element={!authUser ? <SingUpPage /> : <Navigate to='/' />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to='/' />}/>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to='/login'/>}/>

      </Routes>
      <Toaster />
      
    </div>
  )
}

export default App
