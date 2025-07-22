import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { triggerN8nWebhook } from '../api/n8n';
import { useData } from '../context/DataContext';
import { PizzeriaInfo, Pedido } from '../types';

type ConnectionStatus = 'unknown' | 'testing' | 'success' | 'error';

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
const CardFooter: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => <div className={`p-6 pt-4 bg-gray-50/50 rounded-b-2xl ${className}`}>{children}</div>;


const N8nSettings: React.FC = () => {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState<ConnectionStatus>('unknown');
    const [statusMessage, setStatusMessage] = useState('Salvo localmente. Teste a conexão para verificar.');

    useEffect(() => {
        setWebhookUrl(localStorage.getItem('n8nWebhookUrl') || '');
        setApiKey(localStorage.getItem('n8nApiKey') || '');
    }, []);

    const handleSave = () => {
        localStorage.setItem('n8nWebhookUrl', webhookUrl);
        localStorage.setItem('n8nApiKey', apiKey);
        setStatus('unknown');
        setStatusMessage('Configurações salvas! Teste a conexão para verificar.');
    };

    const handleTestConnection = async () => {
        setStatus('testing');
        setStatusMessage('Testando conexão...');
        const result = await triggerN8nWebhook({
            url: webhookUrl,
            apiKey: apiKey,
            payload: {
                event: 'connection_test',
                test: true,
                message: 'Connection test from Japede'
            }
        });

        if (result.success) {
            setStatus('success');
            setStatusMessage('Conexão bem-sucedida!');
        } else {
            setStatus('error');
            setStatusMessage(`Falha na conexão: ${result.error || 'Verifique o URL e a chave de API.'}`);
        }
    };

    const statusConfig = {
        unknown: { color: 'text-gray-500', icon: 'settings' },
        testing: { color: 'text-blue-500', icon: 'settings' },
        success: { color: 'text-green-500', icon: 'check-circle-2' },
        error: { color: 'text-red-500', icon: 'alert-triangle' },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle title="Automações com n8n" subtitle="Conecte para automatizar fluxos de trabalho." icon="webhook" iconClass="bg-blue-500" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="font-semibold text-sm text-gray-700">URL do Webhook</label>
                    <div className="relative mt-1">
                        <Icon name="webhook" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://seu-n8n.com/webhook/..." className="w-full pl-10 p-2 border rounded-lg" />
                    </div>
                </div>
                <div>
                    <label className="font-semibold text-sm text-gray-700">Chave de API / Token</label>
                    <div className="relative mt-1">
                        <Icon name="key-round" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="••••••••••••••••••••" className="w-full pl-10 p-2 border rounded-lg" />
                    </div>
                </div>
                <div className="pt-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                        <Icon name={statusConfig[status].icon} className={`w-5 h-5 ${statusConfig[status].color} ${status === 'testing' ? 'animate-spin' : ''}`} />
                        <p className={`text-sm ${statusConfig[status].color}`}>{statusMessage}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <div className="flex justify-end gap-3">
                    <button onClick={handleTestConnection} disabled={!webhookUrl || status === 'testing'} className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        {status === 'testing' ? 'Testando...' : 'Testar Conexão'}
                    </button>
                    <button onClick={handleSave} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        Salvar
                    </button>
                 </div>
            </CardFooter>
        </Card>
    );
};

const PizzeriaInfoSettings: React.FC = () => {
    const { pizzeriaInfo, updatePizzeriaInfo, categorias, isLoading } = useData();
    const [formState, setFormState] = useState<PizzeriaInfo>(pizzeriaInfo);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormState(pizzeriaInfo);
    }, [pizzeriaInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
        setIsSaved(false);
    };

    const handlePrepTimeChange = (category: string, time: string) => {
        const newPrepTimes = { ...formState.prepTimes, [category]: Number(time) || 0 };
        setFormState({ ...formState, prepTimes: newPrepTimes });
        setIsSaved(false);
    };

    const handleSave = () => {
        updatePizzeriaInfo(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };
    
    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Carregando informações...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle title="Informações da Pizzaria" subtitle="Detalhes do seu estabelecimento." icon="pizza" iconClass="bg-orange-500" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="font-semibold text-sm text-gray-700">Nome da Pizzaria</label>
                        <input type="text" name="nome" value={formState.nome} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="font-semibold text-sm text-gray-700">Telefone</label>
                        <input type="tel" name="telefone" value={formState.telefone} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
                    </div>
                </div>
                <div>
                    <label className="font-semibold text-sm text-gray-700">Endereço</label>
                    <input type="text" name="endereco" value={formState.endereco} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" />
                </div>
                <div>
                    <label className="font-semibold text-sm text-gray-700">URL do Logotipo</label>
                    <input type="url" name="logoUrl" value={formState.logoUrl || ''} onChange={handleChange} className="w-full mt-1 p-2 border rounded-lg" placeholder="https://exemplo.com/logo.png" />
                </div>
                <div className="pt-4 border-t border-orange-100">
                    <h4 className="font-bold text-gray-800 mb-1">Tempo de Preparo (Geral)</h4>
                    <p className="text-xs text-gray-500 mb-3">Este é um tempo de preparo geral, usado em algumas partes do sistema. Para o fluxo da cozinha, use o 'Controle de Fluxo' abaixo.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                        {categorias.map(cat => (
                            <div key={cat}>
                                <label className="font-semibold text-sm text-gray-700 capitalize">{cat}</label>
                                <div className="relative mt-1">
                                    <input
                                        type="number"
                                        value={formState.prepTimes[cat] || ''}
                                        onChange={(e) => handlePrepTimeChange(cat, e.target.value)}
                                        className="w-full p-2 border rounded-lg pr-14"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">min</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <div className="flex justify-end items-center gap-4">
                    {isSaved && <span className="text-green-600 text-sm font-semibold animate-pulse">Salvo com sucesso!</span>}
                    <button onClick={handleSave} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        Salvar Informações
                    </button>
                 </div>
            </CardFooter>
        </Card>
    );
};

const OrderFlowSettings: React.FC = () => {
    const { pizzeriaInfo, updatePizzeriaInfo, isLoading, categorias } = useData();
    const [formState, setFormState] = useState<PizzeriaInfo>(pizzeriaInfo);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormState(pizzeriaInfo);
    }, [pizzeriaInfo]);

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.checked });
        setIsSaved(false);
    };

    const handleTimeChange = (status: Pedido['status'], category: string, time: string) => {
        const newTimings = { ...(formState.statusTimings || {}) };
        if (!newTimings[status]) {
            newTimings[status] = {};
        }
        // Ensure the nested object exists before assigning to it
        const statusTimings = newTimings[status]!;
        statusTimings[category] = Number(time) >= 0 ? Number(time) : 0;
        
        setFormState({ ...formState, statusTimings: newTimings });
        setIsSaved(false);
    };

    const handleSave = () => {
        updatePizzeriaInfo(formState);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const configurableStatuses: Array<{ key: Pedido['status']; label: string }> = [
        { key: 'pendente', label: 'Pendente' },
        { key: 'preparando', label: 'Em Preparo' },
        { key: 'pronto', label: 'Pronto' },
        { key: 'em rota de entrega', label: 'Em Rota de Entrega' },
    ];
    
    if (isLoading) return null;
    
    const allCategoriesForTiming = ['default', ...categorias];

    return (
        <Card>
            <CardHeader>
                <CardTitle title="Controle de Fluxo de Pedidos" subtitle="Configure tempos e automações da cozinha." icon="timer" iconClass="bg-purple-500" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-bold text-gray-800 mb-3">Automação</h4>
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <label htmlFor="autoStartOrders" className="font-semibold text-sm text-gray-700 pr-4">Avançar status dos pedidos automaticamente</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="autoStartOrders" name="autoStartOrders" checked={!!formState.autoStartOrders} onChange={handleToggleChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                     <p className="text-xs text-gray-500 mt-2">Se ativado, os pedidos avançarão para o próximo status automaticamente após o tempo definido expirar.</p>
                </div>

                <div className="pt-4 border-t border-orange-100 space-y-5">
                     {configurableStatuses.map(({ key: statusKey, label: statusLabel }) => (
                        <div key={statusKey} className="p-4 rounded-lg bg-gray-50/50">
                            <h4 className="font-bold text-gray-800 mb-3 capitalize">{`Tempo em: ${statusLabel}`}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3">
                                {allCategoriesForTiming.map((cat) => (
                                    <div key={cat}>
                                        <label className="font-semibold text-sm text-gray-700 capitalize">{cat === 'default' ? 'Padrão (Outros)' : cat}</label>
                                        <div className="relative mt-1">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formState.statusTimings?.[statusKey]?.[cat] ?? ''}
                                                onChange={(e) => handleTimeChange(statusKey, cat, e.target.value)}
                                                className="w-full p-2 border rounded-lg pr-14"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">min</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
             <CardFooter>
                 <div className="flex justify-end items-center gap-4">
                    {isSaved && <span className="text-green-600 text-sm font-semibold animate-pulse">Salvo com sucesso!</span>}
                    <button onClick={handleSave} className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        Salvar Fluxo
                    </button>
                 </div>
            </CardFooter>
        </Card>
    );
};


export default function Settings() {
    return (
        <div className="p-6 space-y-8 max-w-4xl mx-auto min-h-full bg-gradient-to-br from-orange-50/10 to-red-50/10">
             <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                    <Icon name="settings" className="w-8 h-8 text-gray-600"/>
                    Configurações do Sistema
                </h1>
                <p className="text-gray-600 text-lg">Gerencie as integrações e preferências do sistema.</p>
            </div>
            
            <PizzeriaInfoSettings />

            <OrderFlowSettings />

            <N8nSettings />

        </div>
    );
}