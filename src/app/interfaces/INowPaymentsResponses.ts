export interface INowPaymentsInvoice {
    id?: string;
    payment_status?: string
    order_id?: string;
    token_id?: string;
    payout_currency?: string;
    amount_received?: number;
    pay_amount?: number;
    order_description?: string;
    price_currency?: string;
    pay_currency?: string;
    invoice_url?: string;
    ipn_callback_url?: string;
    partially_paid_url?: string;
    success_url?: string;
    cancel_url?: string;
    created_at?: string;
    updated_at?: string;
    type?: string;

    is_fee_paid_by_user?: boolean;
    is_fixed_rate?: boolean;
}

export interface INowPaymentsPayment {
    payment_id?: string;
    payment_status?: string;
    pay_address?: string;
    price_amount?: number;
    price_currency?: string;
    pay_amount?: number;
    amount_received?: number;
    pay_currency?: string;
    order_id?: string;
    payin_extra_id?: string;
    ipn_callback_url?: string;
    created_at?: string;
    updated_at?: string;
    purchase_id?: string;
    smart_contract?: string;
    network?: string;
    network_precision?: string;
    time_limit?: string;
    burning_percent?: string;
    expiration_estimate_date?: string;
    is_fixed_rate?: boolean;
    is_fee_paid_by_user?: boolean;
    valid_until?: string;
    type?: string;
    success?: string
}