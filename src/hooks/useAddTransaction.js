import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {db} from '../config/firebase-config';
import {useGetUserInfo} from './useGetUserInfo';
import {useState} from 'react';

export const useAddTransaction = () => {

    const transactionsCollection = collection(db, "transactions");
    const {userID} = useGetUserInfo();
    const [loading, setLoading] = useState(false);

    const addTransaction = async ({
        description,
        transactionAmount,
        transactionType,
    }) => {
        setLoading(true);
        try {
            await addDoc(transactionsCollection, {
                userID,
                description,
                transactionAmount,
                transactionType,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error adding transaction: ", error);
        } finally {
            setLoading(false);
        }
    };

    return {addTransaction, loading};
}