import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { Pedido, Mesa, ItemCardapio, PizzeriaInfo, Cliente, DataContextType } from '../types';
import { mockPedidos, mockMesas, mockItensCardapio, mockClientes } from '../data/mockData';
import { triggerN8nWebhook } from '../api/n8n';
import { PrintComanda } from '../components/PrintComanda';

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

// Default timings now structured by status and then by category
const defaultPizzeriaInfo: PizzeriaInfo = {
    nome: 'Pizzaria Bella',
    endereco: 'Rua das Pizzas, 123, Saborlândia',
    telefone: '(11) 98765-4321',
    logoUrl: '',
    prepTimes: {
        pizza: 15,
        bebida: 1,
        sobremesa: 5,
        entrada: 7,
        acompanhamento: 10,
    },
    autoStartOrders: false,
    statusTimings: {
        pendente: { 'pizza': 1, 'bebida': 1, 'sobremesa': 1, 'entrada': 1, 'acompanhamento': 1, 'default': 1 },
        preparando: { 'pizza': 8, 'bebida': 1, 'sobremesa': 4, 'entrada': 5, 'acompanhamento': 5, 'default': 5 },
        pronto: { 'pizza': 2, 'bebida': 1, 'sobremesa': 1, 'entrada': 1, 'acompanhamento': 1, 'default': 2 },
        'em rota de entrega': { 'pizza': 15, 'bebida': 15, 'sobremesa': 15, 'entrada': 15, 'acompanhamento': 15, 'default': 15 },
    }
};

const printPedido = (pedido: Pedido, info: PizzeriaInfo) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'Print Frame');

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    if (doc) {
        // Create a root for the React component
        const mountPoint = doc.createElement('div');
        doc.body.appendChild(mountPoint);

        // Copy styles from the main document to the iframe
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('');
                } catch (e) {
                    console.warn('Cannot access stylesheet:', e);
                    return '';
                }
            })
            .join('\n');
            
        const styleElement = doc.createElement('style');
        styleElement.innerHTML = styles;
        doc.head.appendChild(styleElement);
        
        const root = ReactDOM.createRoot(mountPoint);
        // Pass the current pizzeriaInfo to the print component
        root.render(<PrintComanda pedido={pedido} pizzeriaInfo={info} />);

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 500); // 500ms delay to allow content to render.
    }
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [mesas, setMesas] = useState<Mesa[]>([]);
    const [itens, setItens] = useState<ItemCardapio[]>([]);
    const [categorias, setCategorias] = useState<string[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pizzeriaInfo, setPizzeriaInfo] = useState<PizzeriaInfo>(defaultPizzeriaInfo);
    const [currentUser, setCurrentUser] = useState<Cliente | null>(null);

    // Function to calculate the maximum time for an order's current status based on its items
    const getOrderMaxTime = (pedido: Pedido, timings: PizzeriaInfo['statusTimings']): number => {
        const timingsForStatus = timings[pedido.status];
        if (!timingsForStatus) return 0;

        const itemCategories = [...new Set(pedido.itens.map(i => i.item.categoria))];
        if (itemCategories.length === 0) return timingsForStatus['default'] || 0;

        let maxTime = 0;
        for (const category of itemCategories) {
            // Use category-specific time, or fall back to a 'default' time for that status
            const timeForCategory = timingsForStatus[category] ?? timingsForStatus['default'] ?? 0;
            if (timeForCategory > maxTime) {
                maxTime = timeForCategory;
            }
        }
        return maxTime;
    };


    useEffect(() => {
        setTimeout(() => {
            const loadedPedidos = mockPedidos.map(p => ({
                ...p,
                statusChangeTime: new Date(p.statusChangeTime)
            })).sort((a,b) => b.created_date.getTime() - a.created_date.getTime());

            setPedidos(loadedPedidos);
            setMesas(mockMesas);
            setItens(mockItensCardapio); 
            
            const savedClientes = localStorage.getItem('clientes');
            const allClientes = savedClientes ? JSON.parse(savedClientes) : mockClientes;
            setClientes(allClientes);
            
            const initialCategories = [...new Set(mockItensCardapio.map(i => i.categoria))];
            setCategorias(initialCategories.sort());

            const savedInfoRaw = localStorage.getItem('pizzeriaInfo');
            if (savedInfoRaw) {
                let savedInfo = JSON.parse(savedInfoRaw);

                // Migration for statusTimings from old flat structure to new nested structure
                if (savedInfo.statusTimings && savedInfo.statusTimings.pendente && typeof savedInfo.statusTimings.pendente === 'number') {
                    const newTimings: PizzeriaInfo['statusTimings'] = {};
                    const allCategories = [...initialCategories, 'default'];
                    for (const status in savedInfo.statusTimings) {
                        const typedStatus = status as Pedido['status'];
                        newTimings[typedStatus] = {};
                        for (const cat of allCategories) {
                            newTimings[typedStatus]![cat] = savedInfo.statusTimings[status];
                        }
                    }
                    savedInfo.statusTimings = newTimings;
                }
                
                setPizzeriaInfo(prev => ({...defaultPizzeriaInfo, ...prev, ...savedInfo}));
            }
            
            // Re-login user if session exists
            const currentUserId = localStorage.getItem('currentUserId');
            if (currentUserId) {
                const user = allClientes.find((c: Cliente) => c.id === currentUserId);
                if (user) {
                    setCurrentUser(user);
                }
            }


            setIsLoading(false);
        }, 1000);
    }, []);
    
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('clientes', JSON.stringify(clientes));
        }
    }, [clientes, isLoading]);
    
    const triggerReadyWebhook = async (readyPedido: Pedido) => {
        const webhookUrl = localStorage.getItem('n8nWebhookUrl');
        const apiKey = localStorage.getItem('n8nApiKey');
        
        if (webhookUrl && readyPedido) {
           try {
               await triggerN8nWebhook({
                   url: webhookUrl,
                   apiKey: apiKey || '',
                   payload: {
                       event: 'order_ready',
                       pedido: readyPedido,
                   }
               });
               console.log(`n8n webhook triggered for order ${readyPedido.id}`);
           } catch (error) {
               console.error('Failed to trigger n8n webhook:', error);
           }
       }
    };
    
    // Effect for automatic order status transitions
    useEffect(() => {
        if (!pizzeriaInfo.autoStartOrders || isLoading) return;

        const interval = setInterval(() => {
            setPedidos(currentPedidos => {
                const now = Date.now();
                let hasChanges = false;
                
                const updatedPedidos = currentPedidos.map(pedido => {
                    const statusDurationMinutes = getOrderMaxTime(pedido, pizzeriaInfo.statusTimings);
                    const statusDurationMs = statusDurationMinutes * 60 * 1000;
                    
                    if (statusDurationMs <= 0) return pedido;

                    const timeInStatus = now - new Date(pedido.statusChangeTime).getTime();

                    if (timeInStatus > statusDurationMs) {
                        let nextStatus: Pedido['status'] | null = null;
                        
                        if (pedido.status === 'pendente') nextStatus = 'preparando';
                        else if (pedido.status === 'preparando') nextStatus = 'pronto';
                        else if (pedido.status === 'pronto') nextStatus = 'em rota de entrega';

                        if (nextStatus) {
                            hasChanges = true;
                            const newPedidoData = { ...pedido, status: nextStatus, statusChangeTime: new Date(now) };
                            if(nextStatus === 'pronto') {
                                triggerReadyWebhook(newPedidoData);
                            }
                            return newPedidoData;
                        }
                    }
                    return pedido;
                });
                
                return hasChanges ? updatedPedidos : currentPedidos;
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [pizzeriaInfo.autoStartOrders, pizzeriaInfo.statusTimings, isLoading]);

    const updatePedidoStatus = (pedidoId: string, status: Pedido['status']) => {
        let updatedPedido: Pedido | undefined;
        const now = new Date();
        
        setPedidos(prev =>
            prev.map(p => {
                if (p.id === pedidoId) {
                    updatedPedido = { ...p, status, statusChangeTime: now };
                    return updatedPedido;
                }
                return p;
            })
        );

        if (updatedPedido && updatedPedido.status === 'pronto') {
            triggerReadyWebhook(updatedPedido);
        }
    };

    const updateMesaStatus = (mesaId: number, status: Mesa['status']) => {
        setMesas(prev => prev.map(m => (m.id === mesaId ? { ...m, status } : m)));
    };
    
    const addPedido = (pedido: Pedido) => {
        setPedidos(prev => [pedido, ...prev]);
        printPedido(pedido, pizzeriaInfo);
    };

    const addCliente = (clienteData: Omit<Cliente, 'id'>): Cliente => {
        const newCliente: Cliente = { ...clienteData, id: `c-${Date.now()}`};
        setClientes(prev => [...prev, newCliente]);
        return newCliente;
    };
    
    const updateCliente = (clienteToUpdate: Cliente) => {
        setClientes(prev => prev.map(c => c.id === clienteToUpdate.id ? clienteToUpdate : c));
    };

    const deleteCliente = (clienteId: string) => {
        setClientes(prev => prev.filter(c => c.id !== clienteId));
    };

    const saveItem = (itemToSave: ItemCardapio) => {
        setItens(prev => {
            const exists = prev.some(i => i.id === itemToSave.id);
            if (exists) {
                return prev.map(i => i.id === itemToSave.id ? itemToSave : i);
            } else {
                const newItem = { ...itemToSave, id: `item-${Date.now()}` };
                return [newItem, ...prev];
            }
        });
    };

    const deleteItem = (itemId: string) => {
        setItens(prev => prev.filter(i => i.id !== itemId));
    };

    const addCategoria = (categoria: string) => {
        setCategorias(prev => {
            const lowerCaseCat = categoria.toLowerCase();
            if (prev.includes(lowerCaseCat)) return prev;
            return [...prev, lowerCaseCat].sort();
        });
    }

    const updatePizzeriaInfo = (info: PizzeriaInfo) => {
        localStorage.setItem('pizzeriaInfo', JSON.stringify(info));
        setPizzeriaInfo(info);
    };

    // --- AUTH METHODS ---
    const login = (telefone: string): boolean => {
        const client = clientes.find(c => c.telefone === telefone);
        if (client) {
            setCurrentUser(client);
            localStorage.setItem('currentUserId', client.id);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUserId');
    };

    const register = (clienteData: Omit<Cliente, 'id'>): Cliente | null => {
        const existingClient = clientes.find(c => c.telefone === clienteData.telefone);
        if (existingClient) {
            return null; // Indicate that user already exists
        }
        const newClient = addCliente(clienteData);
        login(newClient.telefone);
        return newClient;
    };


    const value: DataContextType = {
        pedidos,
        mesas,
        itens,
        categorias,
        clientes,
        isLoading,
        updatePedidoStatus,
        updateMesaStatus,
        addPedido,
        addCliente,
        updateCliente,
        deleteCliente,
        saveItem,
        deleteItem,
        addCategoria,
        pizzeriaInfo,
        updatePizzeriaInfo,
        currentUser,
        login,
        logout,
        register,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};