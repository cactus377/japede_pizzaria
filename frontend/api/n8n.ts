
import { Pedido } from "../types";

interface TriggerPayload {
    url: string;
    apiKey: string;
    payload: {
        event: string;
        pedido?: Pedido;
        test?: boolean;
        message?: string;
    };
}

export const triggerN8nWebhook = async ({ url, apiKey, payload }: TriggerPayload): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Many n8n instances use Bearer token or basic auth in the URL.
                // A custom header is also a common pattern.
                'Authorization': `Bearer ${apiKey}`,
                'X-Api-Key': apiKey,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
        
        // n8n webhooks often respond with a success message
        const result = await response.json();
        console.log('n8n response:', result);
        
        return { success: true };
    } catch (error: any) {
        console.error('n8n Webhook Error:', error);
        return { success: false, error: error.message };
    }
};
