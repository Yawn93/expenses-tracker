import {useAddTransaction} from '../../hooks/useAddTransaction';
import {signOut} from 'firebase/auth';
import {useState} from 'react';
import {useGetTransactions} from '../../hooks/useGetTransactions';
import {useGetUserInfo} from '../../hooks/useGetUserInfo';
import {useNavigate} from 'react-router-dom'
import {auth} from "../../config/firebase-config";
import { doc, deleteDoc, getDocs, writeBatch, collection } from "firebase/firestore";
import { db } from "../../config/firebase-config"; 

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
        <>
    <div className="expense-tracker">

        <div className="container">
        <h1> {userName}'s Expense Tracker</h1>
        <div className="balance">
            <h3>Your balance</h3>
            {balance >= 0 ? <h2>{balance}€</h2> : <h2>-{balance * -1}€</h2>}
        </div>
        <div className="summary">
            <div className="income">
                <h4>Income</h4>
                <p>{income}€</p>
            </div>
            <div className="expenses">
            <h4>Expenses</h4>
            <p>{expenses}€</p>
            </div>
        </div>
        <form className="add-transaction" onSubmit={onSubmit}>
            <input
            type="text"
            required
            placeholder="Description"
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
            <input
            type="radio"
            id="expense"
            value="expense"
            checked={transactionType === 'expense'}
            onChange={(e) => setTransactionType(e.target.value)}
            />
            <label htmlFor="expense">Expenses</label>
            <input
            type="radio"
            id="income"
            value="income"
            checked={transactionType === 'income'}
            onChange={(e) => setTransactionType(e.target.value)}
            />
            <label htmlFor="income">Income</label>

            <button type="submit">Add Transaction</button>
        </form>
        </div>
        {profilePhoto && (
            <div className="profile">
                <img className="profile-photo" src={profilePhoto}/>
                <button className="sign-out-btn" onClick={signUserOut}>Sign Out</button>
            </div>
        )}
    </div>
    <div className="transactions">
        <h3>List of Transactions</h3>
        <ul>
            {transactions.map((transaction) => {
                return (
                <li key={transaction.id}>
                    <h4>{transaction.description}</h4>
                    <p>{transaction.transactionAmount} €</p>
                    <p style={{color: transaction.transactionType === "expense" ? "red" : "green"}}>{transaction.transactionType}</p>
                    <button onClick={() => handleDeleteTransaction(transaction.id)}>x</button> {/* Delete button */}
                </li>
                );
            })}
        </ul>
        <button onClick={handleClearAll} className="clear-all-btn">Clear All</button> {/* Clear All button */}
    </div>
    </>
    );
}