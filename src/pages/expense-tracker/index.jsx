import {useAddTransaction} from '../../hooks/useAddTransaction';
import {signOut} from 'firebase/auth';
import {useState} from 'react';
import {useGetTransactions} from '../../hooks/useGetTransactions';
import {useGetUserInfo} from '../../hooks/useGetUserInfo';
import {useNavigate} from 'react-router-dom'
import {auth} from "../../config/firebase-config";
import { doc, deleteDoc, getDocs, writeBatch, collection } from "firebase/firestore";
import { db } from "../../config/firebase-config"; 
import './styles.css';

export const Expenses = () => {

    const {addTransaction} = useAddTransaction();
    const {transactions, transactionTotal} = useGetTransactions();
    const {userName, profilePhoto} = useGetUserInfo();
    const navigate = useNavigate();

    const [description, setDescription] = useState("");
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [transactionType, setTransactionType] = useState("expense");

    const {balance, expenses, income} = transactionTotal

    const onSubmit = (e) => {
        e.preventDefault();
        addTransaction({
            description,
            transactionAmount,
            transactionType,
        });

        setDescription("");
        setTransactionAmount("");
    };

    const signUserOut = async () => {
        try {
        await signOut(auth);
        localStorage.clear();
        navigate("/");
        } catch (err) {
            console.log(err);
        }

    }

    const handleDeleteTransaction = async (id) => {
        try {
            const transactionRef = doc(db, "transactions", id);
            await deleteDoc(transactionRef); // Delete from Firestore
            console.log(`Transaction with ID ${id} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting transaction:", error);
        }
    };
    
    const handleClearAll = async () => {
        try {
            const transactionsSnapshot = await getDocs(collection(db, "transactions"));
            const batch = writeBatch(db);
    
            transactionsSnapshot.forEach((doc) => {
                batch.delete(doc.ref); // Add delete operation for each transaction
            });
    
            await batch.commit(); // Commit all deletions
            console.log("All transactions cleared successfully.");
        } catch (error) {
            console.error("Error clearing all transactions:", error);
        }
    };
    

    return (
        <div className="expense-tracker">
            {/* Header Section */}
            <header className="header">
                <h1>{userName}'s Expense Tracker</h1>
                {profilePhoto && (
                    <div className="profile">
                        <img className="profile-photo" src={profilePhoto} alt="Profile" />
                        <span>{userName}</span>
                        <button className="sign-out-btn" onClick={signUserOut}>Sign Out</button>
                    </div>
                )}
            </header>
    
            {/* Balance and Summary Section */}
            <div className="summary-container">
                <div className="balance-card">
                    <h2 style={{ color: balance >= 0 ? "green" : "#E35F6F" }}>{balance}€</h2>
                    <p>Balance</p>
                </div>
                <div className="income-card">
                    <h2>{income}€</h2>
                    <p>Income</p>
                </div>
                <div className="expenses-card">
                    <h2>{expenses}€</h2>
                    <p>Expenses</p>
                </div>
            </div>
    
            {/* Add Transaction Form */}
            <div className="add-transaction-form">
                <h3>Add a new expense/income</h3>
                <form onSubmit={onSubmit}>
                    <input
                        type="text"
                        required
                        placeholder="Name"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type="number"
                        required
                        placeholder="Amount"
                        value={transactionAmount}
                        onChange={(e) => setTransactionAmount(e.target.value)}
                    />
                    <div className="transaction-type">
                        <div>
                        <label>
                            <input
                                type="radio"
                                id="expense"
                                value="expense"
                                checked={transactionType === 'expense'}
                                onChange={(e) => setTransactionType(e.target.value)}
                            />
                            Expense
                        </label>
                        <label>
                            <input
                                type="radio"
                                id="income"
                                value="income"
                                checked={transactionType === 'income'}
                                onChange={(e) => setTransactionType(e.target.value)}
                            />
                            Income
                        </label>
                        </div>
                        <div>
                        <button type="submit" className="add-btn">Add</button>
                        </div>
                    </div>
                </form>
            </div>
    
            {/* Transactions List Section */}
            <div className="transactions-list">
                <div className="header-transactions">
                    <h3>List of expenses/incomes</h3>
                    <button onClick={handleClearAll} className="clear-all-btn">Clear All</button>
                </div>
                <ul>
                    {transactions.map((transaction) => (
                        <li key={transaction.id} className="transaction-item">
                            <div className="transaction-info">
                                <span>{transaction.description}</span>
                                <span style={{ color: transaction.transactionType === "expense" ? "#E35F6F" : "#45a049" }}>
                                    {transaction.transactionType}
                                </span>
                                <span>{transaction.transactionAmount}€</span>
                            </div>
                            <button
                                className="delete-btn"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                                x
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
    
}