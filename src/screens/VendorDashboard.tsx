import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VendorLayout from '../components/vendor/VendorLayout';
import VendorStore from '../components/vendor/VendorStore';
import VendorWallet from '../components/vendor/VendorWallet';
import VendorOrders from '../components/vendor/VendorOrders';
import VendorProfile from '../components/vendor/VendorProfile';

export default function VendorDashboard() {
  return (
    <VendorLayout>
      <Routes>
        <Route path="/" element={<VendorStore />} />
        <Route path="/wallet" element={<VendorWallet />} />
        <Route path="/orders" element={<VendorOrders />} />
        <Route path="/profile" element={<VendorProfile />} />
      </Routes>
    </VendorLayout>
  );
}