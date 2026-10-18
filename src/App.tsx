import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Forgot from './pages/auth/Forgot'
import Reset from './pages/auth/Reset'
import Workspace from './pages/auth/Workspace'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Leads from './pages/Leads'
import Pipeline from './pages/Pipeline'
import Deals from './pages/Deals'
import Conversations from './pages/Conversations'
import Tasks from './pages/Tasks'
import Calendar from './pages/CalendarPage'
import Campaigns from './pages/Campaigns'
import AiAssistant from './pages/AiAssistant'
import Reports from './pages/Reports'
import Team from './pages/Team'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Help from './pages/Help'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/workspace" element={<Workspace />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
