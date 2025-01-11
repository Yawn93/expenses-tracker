export const useGetUserInfo = () => {
    const authData = localStorage.getItem("auth");
    
    // Check if the authData exists, then parse it
    if (authData) {
        const { userName, profilePhoto, userID, isAuth } = JSON.parse(authData);
        return { userName, profilePhoto, userID, isAuth };
    } else {
        // Return defaults or null/undefined values in case auth data doesn't exist
        return { userName: null, profilePhoto: null, userID: null, isAuth: false };
    }
};
