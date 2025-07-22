

import React from 'react';
import { Pedido, Mesa } from '../types';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- SUB-COMPONENTS ---

const Card: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={`glass-effect border-0 pizza-shadow rounded-3xl ${className}`}>
        {children}
    </div>
);
const CardHeader: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => <div className={`p-6 pb-3 ${className}`}>{children}</div>;
const CardTitle: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>;
const CardContent: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const StatsCard: React.FC<{ title: string; value: string | number; icon: string; color: string; trend: string; isLoading: boolean }> = ({ title, value, icon, color, trend, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-gray-200 animate-pulse rounded-3xl h-40"></div>
        );
    }
    return (
        <Card className="p-1 hover:scale-105 transition-transform duration-300">
            <div className={`relative overflow-hidden rounded-3xl p-6 text-white ${color}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium opacity-80">{title}</p>
                        <p className="text-4xl font-bold mt-1">{value}</p>
                    </div>
                    <Icon name={icon} className="w-8 h-8 opacity-70"/>
                </div>
                <p className="text-xs mt-4 opacity-90">{trend}</p>
            </div>
        </Card>
    );
};

const RecentOrders: React.FC<{ pedidos: Pedido[]; isLoading: boolean }> = ({ pedidos, isLoading }) => {
    const statusStyles: {[key: string]: string} = {
        preparando: 'bg-yellow-100 text-yellow-800',
        pendente: 'bg-blue-100 text-blue-800',
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon name="shopping-bag" className="w-5 h-5 text-blue-600"/>
                    Pedidos Ativos Recentes
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pedidos.slice(0, 5).map(p => (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                        {p.cliente.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{p.cliente.nome}</p>
                                        <p className="text-xs text-gray-500">{p.id.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[p.status] || 'bg-gray-200'}`}>
                                        {p.status}
                                    </span>
                                    <p className="font-bold text-sm text-gray-800 mt-1">R$ {p.valor_total.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const TableStatus: React.FC<{ mesas: Mesa[]; isLoading: boolean }> = ({ mesas, isLoading }) => {
    const getStatusColor = (status: Mesa['status']) => {
        switch (status) {
            case 'ocupada': return 'bg-red-500 border-red-700';
            case 'livre': return 'bg-green-400 border-green-600';
            case 'reservada': return 'bg-yellow-400 border-yellow-600';
        }
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon name="users" className="w-5 h-5 text-purple-600"/>
                    Status das Mesas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 gap-3">
                    {isLoading ? [...Array(16)].map((_, i) => <div key={i} className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"/>)
                    : mesas.map(mesa => (
                        <div key={mesa.id} className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl text-white font-bold text-lg border-b-4 transition-transform hover:scale-110 ${getStatusColor(mesa.status)}`}>
                            {mesa.numero}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const SalesChart: React.FC<{ pedidos: Pedido[]; isLoading: boolean }> = ({ pedidos, isLoading }) => {
    const salesData = pedidos
        .filter(p => p.status === 'entregue')
        .reduce((acc, p) => {
            const day = p.created_date.toLocaleDateString('pt-BR', { weekday: 'short' });
            if (!acc[day]) acc[day] = 0;
            acc[day] += p.valor_total;
            return acc;
        }, {} as Record<string, number>);

    const chartData = Object.keys(salesData).map(day => ({ name: day.slice(0,3), Vendas: salesData[day] })).reverse();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon name="dollar-sign" className="w-5 h-5 text-green-600"/>
                    Vendas da Semana
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <div className="h-[300px] bg-gray-200 rounded-lg animate-pulse" /> :
                <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="name" stroke="#888888" />
                            <YAxis stroke="#888888" />
                            <Tooltip contentStyle={{backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '10px'}}/>
                            <Legend />
                            <Line type="monotone" dataKey="Vendas" stroke="#dc2626" strokeWidth={3} dot={{r:5}} activeDot={{r:8}}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>}
            </CardContent>
        </Card>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const { pedidos, mesas, isLoading } = useData();

  const isToday = (someDate: Date) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
      someDate.getMonth() == today.getMonth() &&
      someDate.getFullYear() == today.getFullYear()
  }

  const pedidosAtivos = pedidos.filter(p => ['pendente', 'preparando'].includes(p.status));
  const mesasOcupadas = mesas.filter(m => m.status === 'ocupada');
  
  const pedidosDeHoje = pedidos.filter(p => p.status === 'entregue' && isToday(p.created_date));

  const vendaHoje = pedidosDeHoje.reduce((sum, p) => sum + p.valor_total, 0);
  const lucroHoje = pedidosDeHoje.reduce((sum, p) => sum + p.lucro, 0);


  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">
          Dashboard <span className="text-2xl">🍕</span>
        </h1>
        <p className="text-gray-600 text-lg">Visão geral da sua pizzaria em tempo real</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Pedidos Ativos" value={pedidosAtivos.length} icon="shopping-bag" color="bg-gradient-to-r from-blue-500 to-blue-600" trend={`${pedidos.filter(p => p.status === 'pendente').length} na fila`} isLoading={isLoading} />
        <StatsCard title="Vendas Hoje" value={`R$ ${vendaHoje.toFixed(2)}`} icon="dollar-sign" color="bg-gradient-to-r from-green-500 to-green-600" trend={`${pedidosDeHoje.length} pedidos hoje`} isLoading={isLoading} />
        <StatsCard title="Lucro de Hoje" value={`R$ ${lucroHoje.toFixed(2)}`} icon="line-chart" color="bg-gradient-to-r from-emerald-500 to-emerald-600" trend="Lucro estimado" isLoading={isLoading} />
        <StatsCard title="Mesas Ocupadas" value={`${mesasOcupadas.length}/${mesas.length}`} icon="users" color="bg-gradient-to-r from-purple-500 to-purple-600" trend={`${Math.round((mesasOcupadas.length / (mesas.length || 1)) * 100)}% ocupação`} isLoading={isLoading} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <RecentOrders pedidos={pedidosAtivos} isLoading={isLoading} />
          <SalesChart pedidos={pedidos} isLoading={isLoading} />
        </div>
        
        <div className="space-y-6">
          <TableStatus mesas={mesas} isLoading={isLoading} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="chef-hat" className="w-5 h-5 text-orange-600" />
                Status da Cozinha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            {isLoading ? <div className="h-24 bg-gray-200 rounded-lg animate-pulse" /> : <>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pizzas Preparando</span>
                <span className="font-bold text-orange-600 text-lg">{pedidos.filter(p => p.status === 'preparando').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Na Fila</span>
                <span className="font-bold text-blue-600 text-lg">{pedidos.filter(p => p.status === 'pendente').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prontos</span>
                <span className="font-bold text-green-600 text-lg">{pedidos.filter(p => p.status === 'pronto').length}</span>
              </div>
            </>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}