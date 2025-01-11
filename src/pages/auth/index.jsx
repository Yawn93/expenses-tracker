import {auth, provider} from '../../config/firebase-config';
import {signInWithPopup} from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import {useGetUserInfo} from '../../hooks/useGetUserInfo';
import './styles.css';

export const Auth = () => {

const navigate = useNavigate();
const {isAuth} = useGetUserInfo();

const signInWithGoogle = async () => {
    const results = await signInWithPopup(auth, provider);
    const authInfo = {
        userID: results.user.uid,
        userName: results.user.displayName,
        profilePhoto: results.user.photoURL,
        isAuth: true,
    };
    localStorage.setItem("auth", JSON.stringify(authInfo));
    navigate("/expense-tracker");
};

if (isAuth) {
    return <Navigate to="/expense-tracker" />;
}


    return (
    <>
    <div className="login-container">
        <div className="image-container">
            <img src={require('../../assets/main.png')} alt="Main cover" className="full-image" />
        </div>
        <div className="login-page">
            <h1>Your savings, explained</h1>
            <p>Please sign-in below to continue to your Expense Tracker</p>
            <button className="login-with-google-btn" onClick={signInWithGoogle}><img src={require('../../assets/google.png')} alt="Google" className="google"/> Sign in with Google</button>
        </div>
    </div>
    </>
    );
};