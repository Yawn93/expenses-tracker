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
import { ClipLoader } from 'react-spinners';
import { css } from '@emotion/react';
import { Pie } from "react-chartjs-2";
import { MDBContainer } from "mdbreact";
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

export const Expenses = () => {

    const {addTransaction, loading: addingTransaction} = useAddTransaction();
    const {transactions, transactionTotal, loading: fetchingTransactions} = useGetTransactions();
    const {userName, profilePhoto} = useGetUserInfo();
    const navigate = useNavigate();

    const [description, setDescription] = useState("");
    const [transactionAmount, setTransactionAmount] = useState(0);
    const [transactionType, setTransactionType] = useState("expense");
    const [deletingTransaction, setDeletingTransaction] = useState(false);
    const [clearingAllTransactions, setClearingAllTransactions] = useState(false);
    const [isLightTheme, setIsLightTheme] = useState(false); 

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
        setDeletingTransaction(true);
        try {
            const transactionRef = doc(db, "transactions", id);
            await deleteDoc(transactionRef); // Delete from Firestore
            console.log(`Transaction with ID ${id} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting transaction:", error);
        } finally {
            setDeletingTransaction(false);
        }
    };
    
    const handleClearAll = async () => {
        setClearingAllTransactions(true);
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
        } finally {
            setClearingAllTransactions(false);
        }
    };

    const loaderStyle = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

const overlayStyle = css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const data = {
    labels: ["expenses", "income"],
    datasets: [
        {
            data: [expenses, income],
            backgroundColor: ["#4CAF50", "#B1E4B3"],
        }
    ]
}

const options = {
    animation: false // Disable animation
};

const toggleTheme = () => {
    setIsLightTheme(!isLightTheme);
};

    

    return (
        <div className={`expense-tracker ${isLightTheme ? 'light-theme' : 'dark-theme'}`}>
            {addingTransaction && (
                <div css={overlayStyle}>
                    <ClipLoader css={loaderStyle} size={50} color={"#4CAF50"} />
                </div>
            )}
            {deletingTransaction && (
                <div css={overlayStyle}>
                    <ClipLoader css={loaderStyle} size={50} color={"#4CAF50"} />
                </div>
            )}
            {clearingAllTransactions && (
                <div css={overlayStyle}>
                    <ClipLoader css={loaderStyle} size={50} color={"#4CAF50"} />
                </div>
            )}
            {/* Header Section */}
            <header className="header">
                <h1>{userName}'s Expense Tracker</h1>
                {profilePhoto && (
                    <div className="profile">
                        <img className="profile-photo" src={profilePhoto} alt="Profile" />
                        <span>{userName}</span>
                        <button className="sign-out-btn" onClick={signUserOut}>Sign Out</button>
                        <label className="theme-toggle">
                            <input type="checkbox" onChange={toggleTheme} />
                            <span className="slider"></span>
                        </label>
                    </div>
                )}
            </header>
    
            {/* Pie Chart */}
            <div className="summary-container">
                <div className="pie-container">
            <MDBContainer>
                <Pie data={data} options={options}/>
            </MDBContainer>
                </div>
                <div className="balance-card">
                    <h2 style={{ color: balance >= 0 ? "green" : "#E35F6F", fontSize: "48px" }}>{balance}€</h2>
                    <p>Balance</p>
                        <hr className="divider" />
                    <h2>{income}€</h2>
                    <p>Income</p>
                        <hr className="divider" />
                    <h2>{expenses}€</h2>
                    <p>Expenses</p>
                </div>
                 {/* Add Transaction Form */}
            <div className="add-transaction-form">
                <h3>Add a new expense/income</h3>
                <p className="description-text">
                    Use the form below to add a new expense or income to your tracker. Enter the name, amount, and select whether it is an expense or income.
                </p>
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
            </div>
    
    
            {/* Transactions List Section */}
            <div className="transactions-list">
                <div className="header-transactions">
                    <h3>List of expenses/incomes</h3>
                    <button onClick={handleClearAll} className="clear-all-btn">Clear All</button>
                </div>
                {fetchingTransactions ? (
                    <ClipLoader css={loaderStyle} size={50} color={"#ffffff"} />
                ) : (
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
                )}
            </div>
        </div>
    );
}