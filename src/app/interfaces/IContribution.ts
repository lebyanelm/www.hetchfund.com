export interface IContribution {
    _id?: string,
    key?: string,

    time_created?: {
        day?: number,
        month?: string,
        year?: number,
        formatted_date?: string,
        time?: string,
        timestamp?: number
    },
    last_modified?: {
        day?: number,
        month?: string,
        year?: number,
        formatted_date?: string,
        time?: string,
        timestamp?: number
    },

    _selected_database_?: string,
    pitch_key?: string,
    pitch_name?: string,
    reward_name?: string,
    charge_id?: string,
    amount?: number,
    amount_in_currency?: number,
    payment_source?: string,
    payment_method?: IYocoPaymentMethod,

    fees?: IContributionFees, // ALL FEES IN PLATFORM CURRENCY
    fees_in_currency?: IContributionFees, // ALL FEES IN USER PAYMENT CURRENCY

    amount_minus_fees?: number,
    amount_in_currency_minus_fees?: number,
    currency?: string,
    currency_symbol?: string,
    progress_contributed?: number,
    from_progress?: number,
    progress_left?: number,
    status?: string,
    payer?: any, //{id: string, name: string} | string
    hetcher?: string,
    rewards_address?: null,
    is_approved?: string,
    is_viewed?: boolean,
    is_allocated?: boolean,
    is_rewards_address_confirmed?: boolean,
    _schema_version_?: 1
}

export interface IContributionFees {
    payment_provider?: number,
    platform?: number,
    total_fees?: number
}

export interface IYocoPaymentMethod {
    id?: string,
    brand?: string,
    maskedCard?: string,
    expiryMonth?: number,
    expiryYear?: number,
    fingerprint?: string,
    object?: string,
    country?: string
}