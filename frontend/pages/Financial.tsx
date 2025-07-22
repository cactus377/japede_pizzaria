

import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Pedido } from '../types';

// --- Reusable Components ---
const Card: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-md ${className}`}>
        {children}
    </div>
);
const CardHeader: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => <div className={`p-6 pb-4 border-b border-orange-100 ${className}`}>{children}</div>;
const CardTitle: React.FC<{title:string; subtitle:string; icon:string; iconClass:string;}> = ({ title, subtitle, icon, iconClass }) => (
    <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClass}`}>
            <Icon name={icon} className="w-6 h-6 text-white" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
    </div>
);
const CardContent: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => <div className={`p-6 ${className}`}>{children}</div>;

const FinancialStatsCard: React.FC<{ title: string, value: string, icon: string, color: string, isLoading: boolean }> = ({ title, value, icon, color, isLoading }) => {
    if (isLoading) return <div className="bg-gray-200/80 animate-pulse rounded-xl h-24" />;
    return (
        <div className={`p-5 rounded-xl text-white ${color}`}>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium opacity-80">{title}</p>
                <Icon name={icon} className="w-6 h-6 opacity-70" />
            </div>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
    );
};

const TransactionHistory: React.FC<{ pedidos: Pedido[], isLoading: boolean }> = ({ pedidos, isLoading }) => {
    const statusConfig = {
        entregue: { color: 'text-green-600', icon: 'check-circle-2' },
        cancelado: { color: 'text-red-600', icon: 'x' },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle title="Histórico de Transações" subtitle="Todos os pedidos finalizados e cancelados" icon="shopping-bag" iconClass="bg-blue-500" />
            </CardHeader>
            <CardContent className="h-96 overflow-y-auto hide-scrollbar">
                <div className="space-y-3">
                    {isLoading && [...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />)}
                    {!isLoading && pedidos.map(p => {
                        const config = statusConfig[p.status as keyof typeof statusConfig] || { color: 'text-gray-500', icon: 'help-circle'};
                        return (
                            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Icon name={config.icon} className={`w-5 h-5 ${config.color}`} />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{p.cliente.nome}</p>
                                        <p className="text-xs text-gray-500">{p.created_date.toLocaleDateString('pt-BR')} - ID: {p.id.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${p.lucro >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {p.lucro >= 0 ? `+R$ ${p.lucro.toFixed(2)}` : `-R$ ${(p.lucro * -1).toFixed(2)}`}
                                    </p>
                                    <p className="text-xs text-gray-500">R$ {p.valor_total.toFixed(2)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

const RevenueChart: React.FC<{pedidos: Pedido[], isLoading: boolean}> = ({ pedidos, isLoading }) => {
    const data = useMemo(() => {
        const dailyData: Record<string, { faturamento: number, custo: number, lucro: number }> = {};
        pedidos.forEach(p => {
            const day = p.created_date.toLocaleDateString('pt-BR', {month: '2-digit', day: '2-digit'});
            if (!dailyData[day]) dailyData[day] = { faturamento: 0, custo: 0, lucro: 0 };
            dailyData[day].faturamento += p.valor_total;
            dailyData[day].custo += p.custo_total;
            dailyData[day].lucro += p.lucro;
        });
        return Object.entries(dailyData).map(([name, values]) => ({ name, ...values })).reverse();
    }, [pedidos]);

     if (isLoading) return <div className="bg-gray-200/80 animate-pulse rounded-xl h-80" />;

    return (
        <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '10px'}}/>
                <Legend />
                <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="custo" name="Custo" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
        </ResponsiveContainer>
    );
}

const PaymentMethodChart: React.FC<{pedidos: Pedido[], isLoading: boolean}> = ({ pedidos, isLoading }) => {
    const data = useMemo(() => {
        const paymentData = pedidos.reduce((acc, p) => {
            const method = p.pagamento?.metodo || 'indefinido';
            acc[method] = (acc[method] || 0) + p.valor_total;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(paymentData).map(([name, value]) => ({name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    }, [pedidos]);
    
    const COLORS = ['#22c55e', '#6366f1', '#a8a29e'];

     if (isLoading) return <div className="bg-gray-200/80 animate-pulse rounded-xl h-64" />;

    return (
         <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`}/>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}

// --- MAIN FINANCIAL COMPONENT ---
export default function Financial() {
    const { pedidos, isLoading } = useData();

    const financialData = useMemo(() => {
        const deliveredOrders = pedidos.filter(p => p.status === 'entregue');
        const faturamento = deliveredOrders.reduce((sum, p) => sum + p.valor_total, 0);
        const custoTotal = deliveredOrders.reduce((sum, p) => sum + p.custo_total, 0);
        const lucroLiquido = deliveredOrders.reduce((sum, p) => sum + p.lucro, 0);
        const ticketMedio = deliveredOrders.length > 0 ? faturamento / deliveredOrders.length : 0;
        
        const allFinalizedOrders = pedidos.filter(p => ['entregue', 'cancelado'].includes(p.status))
                                          .sort((a,b) => b.created_date.getTime() - a.created_date.getTime());

        return {
            faturamento,
            custoTotal,
            lucroLiquido,
            ticketMedio,
            deliveredOrders,
            allFinalizedOrders
        };
    }, [pedidos]);


    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-full bg-gradient-to-br from-orange-50/10 to-red-50/10">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                    <Icon name="line-chart" className="w-8 h-8 text-emerald-600"/>
                    Financeiro
                </h1>
                <p className="text-gray-600 text-lg">Análise detalhada da performance financeira da sua pizzaria.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinancialStatsCard title="Faturamento Bruto" value={`R$ ${financialData.faturamento.toFixed(2)}`} icon="dollar-sign" color="bg-blue-500" isLoading={isLoading} />
                <FinancialStatsCard title="Custo Total" value={`R$ ${financialData.custoTotal.toFixed(2)}`} icon="shopping-cart" color="bg-red-500" isLoading={isLoading} />
                <FinancialStatsCard title="Lucro Líquido" value={`R$ ${financialData.lucroLiquido.toFixed(2)}`} icon="line-chart" color="bg-green-500" isLoading={isLoading} />
                <FinancialStatsCard title="Ticket Médio" value={`R$ ${financialData.ticketMedio.toFixed(2)}`} icon="users" color="bg-purple-500" isLoading={isLoading} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle title="Receita, Custo e Lucro por Dia" subtitle="Performance financeira nos últimos dias" icon="dollar-sign" iconClass="bg-green-500" />
                </CardHeader>
                <CardContent>
                    <RevenueChart pedidos={financialData.deliveredOrders} isLoading={isLoading} />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                     <TransactionHistory pedidos={financialData.allFinalizedOrders} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                    <Card>
                         <CardHeader>
                            <CardTitle title="Receita por Pagamento" subtitle="Divisão do faturamento por método" icon="credit-card" iconClass="bg-indigo-500" />
                        </CardHeader>
                        <CardContent>
                           <PaymentMethodChart pedidos={financialData.deliveredOrders} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}