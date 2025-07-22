
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Icon from './Icon';

interface LoginModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

type Tab = 'login' | 'register';

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
    const { login, register } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('login');
    const [telefone, setTelefone] = useState('');
    const [nome, setNome] = useState('');
    const [endereco, setEndereco] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!login(telefone)) {
            setError('Telefone não encontrado. Por favor, cadastre-se.');
        } else {
            onSuccess();
        }
    };
    
    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!nome || !telefone) {
            setError('Nome e telefone são obrigatórios.');
            return;
        }
        const newUser = register({ nome, telefone, endereco });
        if (!newUser) {
            setError('Este telefone já está cadastrado. Por favor, faça o login.');
        } else {
            onSuccess();
        }
    };


    const renderLogin = () => (
        <form onSubmit={handleLogin} className="space-y-4">
             <div>
                <label className="font-semibold text-sm text-gray-700">Seu Telefone</label>
                <div className="relative mt-1">
                    <Icon name="phone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(99) 99999-9999" className="w-full pl-10 p-2 border rounded-lg" required />
                </div>
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">Entrar</button>
        </form>
    );

    const renderRegister = () => (
        <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <label className="font-semibold text-sm text-gray-700">Nome Completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="w-full mt-1 p-2 border rounded-lg" required />
            </div>
            <div>
                <label className="font-semibold text-sm text-gray-700">Telefone</label>
                 <div className="relative mt-1">
                    <Icon name="phone" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(99) 99999-9999" className="w-full pl-10 p-2 border rounded-lg" required />
                </div>
            </div>
             <div>
                <label className="font-semibold text-sm text-gray-700">Endereço (para delivery)</label>
                <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Sua rua, número, bairro..." className="w-full mt-1 p-2 border rounded-lg" />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">Cadastrar e Entrar</button>
        </form>
    );
    

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-6 pb-0">
                    <div className="flex border-b">
                        <button onClick={() => { setActiveTab('login'); setError(''); }} className={`py-3 px-6 font-semibold transition-colors ${activeTab === 'login' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
                            Entrar
                        </button>
                        <button onClick={() => { setActiveTab('register'); setError(''); }} className={`py-3 px-6 font-semibold transition-colors ${activeTab === 'register' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}>
                            Cadastrar
                        </button>
                         <div className="flex-grow border-b"></div>
                         <button onClick={onClose} className="p-2 ml-auto mb-2 self-start rounded-full hover:bg-gray-100"><Icon name="x" className="w-6 h-6"/></button>
                    </div>
                </header>
                <main className="p-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {activeTab === 'login' ? renderLogin() : renderRegister()}
                </main>
            </div>
        </div>
    );
}