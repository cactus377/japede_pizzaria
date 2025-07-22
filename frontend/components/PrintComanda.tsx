import React from 'react';
import { Pedido, PizzeriaInfo } from '../types';

interface PrintComandaProps {
    pedido: Pedido;
    pizzeriaInfo: PizzeriaInfo;
}

export const PrintComanda: React.FC<PrintComandaProps> = ({ pedido, pizzeriaInfo }) => {
    const styles = `
        @media print {
            @page {
                size: 80mm auto;
                margin: 0;
            }
            body {
                font-family: 'Courier New', Courier, monospace;
                font-size: 10pt;
                color: #000;
                margin: 0;
                padding: 5mm;
            }
        }
        .comanda-wrapper {
            width: 280px; /* ~75mm */
            font-family: 'Courier New', Courier, monospace;
            color: #000;
            font-size: 10pt;
        }
        .section {
            padding: 10px 0;
            border-bottom: 1px dashed #000;
        }
        .section:last-child {
            border-bottom: none;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .title { font-size: 1.2em; font-weight: bold; margin-bottom: 5px;}
        .item-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .item-details { padding-left: 10px; font-size: 0.9em; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; margin-top: 10px; }
        .via-title { 
            font-size: 1.2em;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            border: 2px solid #000;
            margin-bottom: 15px;
        }
        .separator {
            border-top: 2px dashed #000;
            margin: 20px 0;
        }
        p { margin: 2px 0; }
    `;

    const renderComanda = (via: 'cliente' | 'cozinha') => (
        <div className="comanda-wrapper">
            <div className="via-title">VIA {via === 'cliente' ? 'DO CLIENTE' : 'DA COZINHA/CAIXA'}</div>
            <div className="section center">
                <div className="title">{pizzeriaInfo.nome}</div>
                <p>{pizzeriaInfo.endereco}</p>
                <p>{pizzeriaInfo.telefone}</p>
                <hr style={{borderTop: '1px dashed #000', margin: '5px 0'}}/>
                <p><span className="bold">Pedido:</span> #{pedido.id.toUpperCase()}</p>
                <p>{new Date(pedido.created_date).toLocaleString('pt-BR')}</p>
            </div>
            <div className="section">
                <p><span className="bold">Cliente:</span> {pedido.cliente.nome}</p>
                <p><span className="bold">Tipo:</span> <span style={{textTransform: 'capitalize'}}>{pedido.tipo}</span></p>
                {pedido.tipo === 'mesa' && <p><span className="bold">Mesa:</span> {pedido.mesaId}</p>}
                {pedido.tipo === 'delivery' && pedido.cliente.endereco && <p><span className="bold">Endereço:</span> {pedido.cliente.endereco}</p>}
            </div>
            <div className="section">
                <div className="item-row bold">
                    <span>Item</span>
                    <span>Valor</span>
                </div>
                <hr style={{borderTop: '1px dashed #000', margin: '5px 0'}}/>
                {pedido.itens.map((i, index) => (
                    <div key={index}>
                        <div className="item-row">
                            <span>{i.quantidade}x {i.item.nome}</span>
                            <span>R$ {(i.item.preco * i.quantidade).toFixed(2)}</span>
                        </div>
                        { (i.tamanho && i.tamanho !== 'Único') && <div className="item-details">- Tamanho: {i.tamanho}</div> }
                        { i.borda && <div className="item-details">- Borda: {i.borda.nome}</div> }
                    </div>
                ))}
            </div>
            <div className="section">
                 <div className="total-row">
                    <span>TOTAL</span>
                    <span>R$ {pedido.valor_total.toFixed(2)}</span>
                </div>
                {pedido.pagamento && (
                    <>
                    <p style={{marginTop: '10px'}}><span className="bold">Pagamento:</span> <span style={{textTransform: 'capitalize'}}>{pedido.pagamento.metodo}</span></p>
                    {pedido.pagamento.trocoPara && <p><span className="bold">Troco para:</span> R$ {pedido.pagamento.trocoPara.toFixed(2)}</p>}
                    </>
                )}
            </div>
             <div className="section center">
                 <p className="bold">Obrigado pela preferência!</p>
             </div>
        </div>
    );

    return (
        <div>
             <style>{styles}</style>
            {renderComanda('cliente')}
            <div className="separator"></div>
            {renderComanda('cozinha')}
        </div>
    );
};
