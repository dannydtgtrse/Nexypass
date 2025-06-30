import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UserLayout from '../components/user/UserLayout';
import UserStore from '../components/user/UserStore';
import UserPurchases from '../components/user/UserPurchases';
import UserProfile from '../components/user/UserProfile';

export default function UserDashboard() {
  return (
    <UserLayout>
      <Routes>
        <Route path="/" element={<UserStore />} />
        <Route path="/purchases" element={<UserPurchases />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </UserLayout>
  );
}