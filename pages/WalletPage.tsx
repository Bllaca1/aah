
import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAppContext } from '../hooks/useAppContext';
import { MOCK_TRANSACTIONS } from '../constants';
import type { Transaction } from '../types';
import { TransactionType, TransactionStatus } from '../types';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

function WalletPage() {
    const { user } = useAppContext();

    if (!user) return <div>Loading wallet...</div>;

    const getStatusChip = (status: TransactionStatus) => {
        switch (status) {
            case TransactionStatus.COMPLETED:
                return <span className="px-2 py-1 text-xs font-medium text-green-300 bg-green-900 rounded-full">Completed</span>;
            case TransactionStatus.PENDING:
                return <span className="px-2 py-1 text-xs font-medium text-yellow-300 bg-yellow-900 rounded-full">Pending</span>;
            case TransactionStatus.FAILED:
                return <span className="px-2 py-1 text-xs font-medium text-red-300 bg-red-900 rounded-full">Failed</span>;
            default:
                return null;
        }
    };
    
    const getAmountStyle = (type: TransactionType, amount: number) => {
        const isCredit = [TransactionType.DEPOSIT, TransactionType.MATCH_WIN].includes(type);
        return isCredit ? 'text-green-400' : 'text-red-400';
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Wallet</h1>
                <p className="text-gray-400 mt-1">Manage your credits and view your transaction history.</p>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div>
                        <p className="text-gray-400 text-sm">Current Balance</p>
                        <p className="text-4xl font-bold text-white">{user.credits.toFixed(2)} <span className="text-2xl text-gray-400">Credits</span></p>
                        <p className="text-gray-500 text-sm mt-1">1 Credit = 1 USD</p>
                    </div>
                    <div className="flex space-x-4">
                        <Button variant="secondary" className="!bg-brand-secondary hover:!bg-emerald-500">
                            <ArrowDownCircle className="h-5 w-5 mr-2" />
                            Deposit Crypto
                        </Button>
                         <Button variant="secondary">
                            <ArrowUpCircle className="h-5 w-5 mr-2" />
                            Withdraw Credits
                        </Button>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-sm text-gray-400">
                                <th className="py-2 px-4">Type</th>
                                <th className="py-2 px-4">Amount</th>
                                <th className="py-2 px-4">Date</th>
                                <th className="py-2 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_TRANSACTIONS.map((tx: Transaction) => (
                                <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="py-3 px-4">{tx.type}</td>
                                    <td className={`py-3 px-4 font-mono font-semibold ${getAmountStyle(tx.type, tx.amount)}`}>
                                        {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} C
                                    </td>
                                    <td className="py-3 px-4 text-gray-400">{tx.date}</td>
                                    <td className="py-3 px-4">{getStatusChip(tx.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

export default WalletPage;
