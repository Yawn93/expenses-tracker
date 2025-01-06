export const useGetUserInfo = () => {
    const {userName, profilePhoto, userID, isAuth} = JSON.parse(localStorage.getItem("auth"));

    return {userName, profilePhoto, userID, isAuth};
}