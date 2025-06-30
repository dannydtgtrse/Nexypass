import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProviderLayout from '../components/provider/ProviderLayout';
import ProviderOverview from '../components/provider/ProviderOverview';
import ProductManagement from '../components/provider/ProductManagement';
import UserManagement from '../components/provider/UserManagement';
import ProviderSettings from '../components/provider/ProviderSettings';

export default function ProviderDashboard() {
  return (
    <ProviderLayout>
      <Routes>
        <Route path="/" element={<ProviderOverview />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/settings" element={<ProviderSettings />} />
      </Routes>
    </ProviderLayout>
  );
}