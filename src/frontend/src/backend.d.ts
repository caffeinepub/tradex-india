import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transaction {
    transactionType: string;
    stock: Stock;
    timestamp: bigint;
    quantity: bigint;
    price: number;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export type Time = bigint;
export interface MarketIndex {
    value: number;
    name: string;
    dailyChangePercent: number;
}
export interface Stock {
    name: string;
    dailyChangePercent: number;
    price: number;
    symbol: string;
}
export interface PortfolioEntry {
    stock: Stock;
    buyPrice: number;
    quantity: bigint;
}
export interface UserProfile {
    name: string;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addStock(stock: Stock): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buyStock(symbol: string, quantity: bigint): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllMarketIndices(): Promise<Array<MarketIndex>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllStocks(): Promise<Array<Stock>>;
    getBalance(user: Principal): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getMarketIndex(name: string): Promise<MarketIndex | null>;
    getPortfolio(user: Principal): Promise<Array<PortfolioEntry>>;
    getStock(symbol: string): Promise<Stock | null>;
    getTotalTradeVolume(): Promise<bigint>;
    getTotalUserCount(): Promise<bigint>;
    getTransactionHistory(user: Principal): Promise<Array<Transaction>>;
    getUserBalance(): Promise<number>;
    getUserPortfolio(): Promise<Array<PortfolioEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserTransactionHistory(): Promise<Array<Transaction>>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sellStock(symbol: string, quantity: bigint): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
}
