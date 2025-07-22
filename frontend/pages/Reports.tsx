import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Icon from '../components/Icon';
import { Pedido, ItemCardapio } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const Card: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-md printable-card ${className}`}>
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


export default function Reports() {
    const { pedidos, isLoading } = useData();
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(sevenDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const filteredPedidos = useMemo(() => {
        if (!startDate || !endDate) return [];
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);

        return pedidos.filter(p => {
            const pDate = new Date(p.created_date);
            return p.status === 'entregue' && pDate >= start && pDate <= end;
        });
    }, [pedidos, startDate, endDate]);

    const reportData = useMemo(() => {
        const totalRevenue = filteredPedidos.reduce((acc, p) => acc + p.valor_total, 0);
        const totalProfit = filteredPedidos.reduce((acc, p) => acc + p.lucro, 0);
        const totalOrders = filteredPedidos.length;

        const itemSales: Record<string, {name: string, quantity: number, revenue: number}> = {};
        filteredPedidos.forEach(p => {
            p.itens.forEach(i => {
                if (!itemSales[i.item.id]) {
                    itemSales[i.item.id] = { name: i.item.nome, quantity: 0, revenue: 0 };
                }
                itemSales[i.item.id].quantity += i.quantidade;
                itemSales[i.item.id].revenue += (i.item.preco * i.quantidade); // simplified, should account for size/borda
            });
        });
        const bestSellers = Object.values(itemSales).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
        
        return { totalRevenue, totalProfit, totalOrders, bestSellers };
    }, [filteredPedidos]);

    const handlePrint = () => window.print();

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto min-h-full bg-gradient-to-br from-orange-50/10 to-red-50/10">
            <div className="flex justify-between items-start flex-wrap gap-4 print-hide">
                 <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                        <Icon name="file-text" className="w-8 h-8 text-cyan-600"/>
                        Relatórios
                    </h1>
                    <p className="text-gray-600 text-lg">Gere e imprima relatórios de performance.</p>
                </div>
                 <button onClick={handlePrint} className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-red-700 transition-colors shadow-lg pizza-shadow transform hover:scale-105">
                    <Icon name="printer" className="w-5 h-5"/>
                    Imprimir Relatório
                </button>
            </div>

            <Card className="print-hide">
                <CardContent className="flex flex-wrap items-center justify-center gap-4">
                    <div>
                        <label htmlFor="start_date" className="text-sm font-semibold text-gray-700">Data Início</label>
                        <input type="date" id="start_date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2" />
                    </div>
                     <div>
                        <label htmlFor="end_date" className="text-sm font-semibold text-gray-700">Data Fim</label>
                        <input type="date" id="end_date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-2" />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <div className="text-center mt-4">
                    <h2 className="text-2xl font-bold">Relatório de Vendas</h2>
                    <p className="text-gray-600">De {new Date(startDate).toLocaleDateString('pt-BR')} até {new Date(endDate).toLocaleDateString('pt-BR')}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="text-center">
                            <Icon name="dollar-sign" className="w-10 h-10 mx-auto text-blue-500 mb-2"/>
                            <p className="text-lg text-gray-600">Faturamento Total</p>
                            <p className="text-4xl font-extrabold text-gray-900">R$ {reportData.totalRevenue.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="text-center">
                             <Icon name="line-chart" className="w-10 h-10 mx-auto text-green-500 mb-2"/>
                            <p className="text-lg text-gray-600">Lucro Total</p>
                            <p className="text-4xl font-extrabold text-gray-900">R$ {reportData.totalProfit.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="text-center">
                             <Icon name="shopping-bag" className="w-10 h-10 mx-auto text-red-500 mb-2"/>
                            <p className="text-lg text-gray-600">Pedidos Finalizados</p>
                            <p className="text-4xl font-extrabold text-gray-900">{reportData.totalOrders}</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                     <CardHeader>
                        <CardTitle title="Itens Mais Vendidos" subtitle="Top 10 itens por quantidade vendida no período." icon="pizza" iconClass="bg-orange-500" />
                    </CardHeader>
                    <CardContent>
                        {isLoading && <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />}
                        {!isLoading && reportData.bestSellers.length > 0 && (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={reportData.bestSellers} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={150} tick={{fontSize: 12}} />
                                    <Tooltip cursor={{fill: 'rgba(234, 88, 12, 0.1)'}} formatter={(value: number) => Math.round(value).toString()} />
                                    <Legend />
                                    <Bar dataKey="quantity" name="Quantidade Vendida" fill="#ea580c" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                        {!isLoading && reportData.bestSellers.length === 0 && (
                            <p className="text-center text-gray-500 py-10">Nenhum dado de venda para o período selecionado.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}