export const optionsjs = {
    methods: {
        viewList() {
            alert("List is now on VIEW state");
        },
        checkLoginStatus() {
            const token = localStorage.getItem('auth_token');
            const user = localStorage.getItem('user');

            if (token && user) {
                return JSON.parse(user); // Return user data if logged in
            }
            return null; // Return null if not logged in
        },
        logUserStatus() {
            const loggedInUser = this.checkLoginStatus();
            if (loggedInUser) {
                console.log(`User ${loggedInUser.full_name} is logged in.`);
            } else {
                console.log('No user is logged in.');
            }
        }
    },
    mounted() {
        this.logUserStatus(); // Check login status when the component is mounted
    }
};
