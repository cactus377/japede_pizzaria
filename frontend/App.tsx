

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Cardapio from './pages/Cardapio';
import Pedidos from './pages/Pedidos';
import Cozinha from './pages/Cozinha';
import Mesas from './pages/Mesas';
import Gestao from './pages/Gestao';
import Settings from './pages/Settings';
import Clientes from './pages/Clientes';
import Financial from './pages/Financial';
import Reports from './pages/Reports';
import { DataProvider } from './context/DataContext';

function App() {
    return (
        <HashRouter>
            <DataProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/cardapio" element={<Cardapio />} />
                        <Route path="/pedidos" element={<Pedidos />} />
                        <Route path="/cozinha" element={<Cozinha />} />
                        <Route path="/mesas" element={<Mesas />} />
                        <Route path="/gestao" element={<Gestao />} />
                        <Route path="/clientes" element={<Clientes />} />
                        <Route path="/financeiro" element={<Financial />} />
                        <Route path="/relatorios" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Layout>
            </DataProvider>
        </HashRouter>
    );
}

export default App;